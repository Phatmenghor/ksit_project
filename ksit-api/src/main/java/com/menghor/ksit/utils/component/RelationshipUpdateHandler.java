package com.menghor.ksit.utils.component;

import com.menghor.ksit.feature.auth.models.UserEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class RelationshipUpdateHandler {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * FIXED method to handle relationship updates with correct logic:
     * 
     * Rules:
     * 1. Empty array [] → Delete all existing items
     * 2. With valid existing ID → Update existing item
     * 3. With invalid/non-existent ID → Create new (ignore the ID)
     * 4. No ID (null) → Create new item
     * 5. Existing items not mentioned in request → Delete them
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public <T, D> void updateRelationshipsSimple(
            List<T> existingEntities,
            List<D> updateDtos,
            Function<D, T> createEntity,
            BiConsumer<D, T> updateEntity,
            JpaRepository<T, Long> repository,
            UserEntity parent,
            String relationshipName,
            Function<D, Long> getDtoId) {
        
        
        // If update list is null, don't change anything
        if (updateDtos == null) {
            return;
        }

        // CRITICAL FIX: Always load fresh data from database, ignore passed collection
        final List<T> actualExistingItems = loadExistingItemsFromDatabase(parent.getId(), relationshipName);
        
        Set<Long> existingDbIds = actualExistingItems.stream()
                .map(this::getEntityId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // If empty array provided, delete all existing
        if (updateDtos.isEmpty()) {
            if (!actualExistingItems.isEmpty()) {
                repository.deleteAll(actualExistingItems);
                repository.flush();
                entityManager.clear(); // Clear to ensure deletion is committed
            } else {
            }
            return;
        }

        // Create maps for efficient lookup
        final Map<Long, T> existingEntityMap = actualExistingItems.stream()
                .filter(entity -> getEntityId(entity) != null)
                .collect(Collectors.toMap(this::getEntityId, Function.identity()));
        
        final Set<Long> existingIds = existingEntityMap.keySet();
        
        // Process requested DTOs
        final Set<Long> validRequestedIds = new HashSet<>();
        final Map<Long, D> validRequestedDtos = new HashMap<>();
        final List<D> itemsToCreate = new ArrayList<>();
        
        // Log all requested IDs for debugging
        List<Long> allRequestedIds = updateDtos.stream()
                .map(getDtoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        for (D dto : updateDtos) {
            Long dtoId = getDtoId.apply(dto);
            
            if (dtoId != null && existingEntityMap.containsKey(dtoId)) {
                // Valid existing ID → Update
                validRequestedIds.add(dtoId);
                validRequestedDtos.put(dtoId, dto);
            } else {
                // Invalid ID or No ID → Create new
                itemsToCreate.add(dto);
                if (dtoId != null) {
                } else {
                }
            }
        }
        
        // CRITICAL: Find items to delete (exist in DB but not in valid request)
        final Set<Long> idsToDelete = new HashSet<>(existingIds);
        idsToDelete.removeAll(validRequestedIds);
        
        
        // Step 1: Delete items not in request (MOST IMPORTANT FIX)
        if (!idsToDelete.isEmpty()) {
            final List<T> entitiesToDelete = idsToDelete.stream()
                    .map(existingEntityMap::get)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            
            // CRITICAL FIX: Delete one by one with immediate flush to ensure deletion
            for (T entityToDelete : entitiesToDelete) {
                Long deleteId = getEntityId(entityToDelete);
                repository.delete(entityToDelete);
                repository.flush(); // Immediate flush for each deletion
            }
            
            // Clear entity manager to ensure deletions are committed
            entityManager.clear();
            
            // Verify deletion by reloading
            List<T> remainingItems = loadExistingItemsFromDatabase(parent.getId(), relationshipName);
            Set<Long> remainingIds = remainingItems.stream()
                    .map(this::getEntityId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
        }
        
        // Step 2: Update existing items
        int updatedCount = 0;
        for (Map.Entry<Long, D> entry : validRequestedDtos.entrySet()) {
            Long id = entry.getKey();
            D dto = entry.getValue();
            
            // Reload the entity to ensure we have the latest state
            Optional<T> reloadedEntityOpt = repository.findById(id);
            if (reloadedEntityOpt.isPresent()) {
                T existingEntity = reloadedEntityOpt.get();
                updateEntity.accept(dto, existingEntity);
                repository.save(existingEntity);
                updatedCount++;
            } else {
                log.warn("Entity with ID {} not found for update, will create new instead", id);
                itemsToCreate.add(dto);
            }
        }
        repository.flush();
        
        // Step 3: Create new items
        final List<T> newEntities = new ArrayList<>();
        for (D dto : itemsToCreate) {
            T newEntity = createEntity.apply(dto);
            T savedEntity = repository.save(newEntity);
            newEntities.add(savedEntity);
        }
        repository.flush();
        
        // Final verification
        entityManager.clear(); // Clear to ensure fresh data
        List<T> finalItems = loadExistingItemsFromDatabase(parent.getId(), relationshipName);
        Set<Long> finalIds = finalItems.stream()
                .map(this::getEntityId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        
        // Verify the result matches expectations
        Set<Long> expectedFinalIds = new HashSet<>(validRequestedIds);
        if (!finalIds.equals(expectedFinalIds)) {
            log.error("MISMATCH: Expected IDs {} but found {}", expectedFinalIds, finalIds);
        } else {
        }
    }

    /**
     * FIXED: Load existing items directly from database using JPQL with proper error handling
     */
    @SuppressWarnings("unchecked")
    private <T> List<T> loadExistingItemsFromDatabase(Long userId, String relationshipName) {
        final String entityClassName = mapRelationshipToEntityClass(relationshipName);
        final String jpql = String.format("SELECT e FROM %s e WHERE e.user.id = :userId", entityClassName);
        
        try {
            final List<T> items = entityManager.createQuery(jpql)
                    .setParameter("userId", userId)
                    .getResultList();
            
            if (!items.isEmpty()) {
                List<Long> ids = items.stream()
                        .map(this::getEntityId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
            }
            
            return items;
        } catch (Exception e) {
            log.error("Failed to load existing {} items using JPQL: {}", relationshipName, e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * FIXED: Extract entity ID with proper error handling
     */
    private <T> Long getEntityId(T entity) {
        try {
            return ((com.menghor.ksit.utils.database.BaseEntity) entity).getId();
        } catch (ClassCastException e) {
            log.warn("Entity {} does not extend BaseEntity", entity.getClass().getSimpleName());
            return null;
        } catch (Exception e) {
            log.warn("Error extracting ID from entity: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Map relationship name to entity class name
     */
    private String mapRelationshipToEntityClass(String relationshipName) {
        return switch (relationshipName) {
            case "TeachersProfessionalRank" -> "TeachersProfessionalRankEntity";
            case "TeacherExperience" -> "TeacherExperienceEntity";
            case "TeacherPraiseOrCriticism" -> "TeacherPraiseOrCriticismEntity";
            case "TeacherEducation" -> "TeacherEducationEntity";
            case "TeacherVocational" -> "TeacherVocationalEntity";
            case "TeacherShortCourse" -> "TeacherShortCourseEntity";
            case "TeacherLanguage" -> "TeacherLanguageEntity";
            case "TeacherFamily" -> "TeacherFamilyEntity";
            case "StudentStudiesHistory" -> "StudentStudiesHistoryEntity";
            case "StudentParent" -> "StudentParentEntity";
            case "StudentSibling" -> "StudentSiblingEntity";
            default -> relationshipName + "Entity";
        };
    }
}