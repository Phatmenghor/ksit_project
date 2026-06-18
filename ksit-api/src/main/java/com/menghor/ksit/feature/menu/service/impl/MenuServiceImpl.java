package com.menghor.ksit.feature.menu.service.impl;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.exceptoins.error.NotFoundException;
import com.menghor.ksit.feature.auth.models.Role;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.auth.repository.UserRepository;
import com.menghor.ksit.feature.menu.dto.request.*;
import com.menghor.ksit.feature.menu.dto.response.MenuItemResponseDto;
import com.menghor.ksit.feature.menu.dto.response.UserMenuResponseDto;
import com.menghor.ksit.feature.menu.mapper.MenuMapper;
import com.menghor.ksit.feature.menu.models.MenuItemEntity;
import com.menghor.ksit.feature.menu.models.MenuPermissionEntity;
import com.menghor.ksit.feature.menu.repository.MenuItemRepository;
import com.menghor.ksit.feature.menu.repository.MenuPermissionRepository;
import com.menghor.ksit.feature.menu.service.MenuService;
import com.menghor.ksit.utils.component.MenuPermissionConfig;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuPermissionRepository menuPermissionRepository;
    private final UserRepository userRepository;
    private final MenuMapper menuMapper;
    private final MenuPermissionConfig menuPermissionConfig;

    @Override
    public List<UserMenuResponseDto> getAllMenusWithPermissions(Long userId) {
        log.info("Fetching all menus with permissions for userId={}", userId);
        UserEntity user = getUserById(userId);
        List<MenuItemEntity> allMenus = menuItemRepository.findByStatusOrderByDisplayOrderAscIdAsc(Status.ACTIVE);
        Map<Long, MenuPermissionEntity> userPermissions = getUserCustomPermissions(userId);

        List<UserMenuResponseDto> result = allMenus.stream()
                .map(menu -> buildUserMenuResponseWithPermission(menu, userPermissions))
                .collect(Collectors.toList());

        return buildUserMenuHierarchy(result);
    }

    @Override
    public List<UserMenuResponseDto> getUserViewableMenus(Long userId) {
        return filterViewableMenus(getAllMenusWithPermissions(userId));
    }

    @Override
    public List<UserMenuResponseDto> getMenusByRole(RoleEnum role) {
        List<MenuItemEntity> allMenus = menuItemRepository.findByStatusOrderByDisplayOrderAscIdAsc(Status.ACTIVE);

        List<UserMenuResponseDto> result = allMenus.stream()
                .map(menu -> {
                    UserMenuResponseDto dto = menuMapper.toUserMenuResponse(menu);
                    dto.setCanView(menuPermissionConfig.hasRoleAccess(menu.getCode(), role));
                    dto.setIsCustomized(false);
                    return dto;
                })
                .collect(Collectors.toList());

        return buildUserMenuHierarchy(result);
    }

    @Override
    public List<MenuItemResponseDto> getAllMenuItems() {
        List<MenuItemEntity> allMenus = menuItemRepository.findByStatusOrderByDisplayOrderAscIdAsc(Status.ACTIVE);
        return buildMenuHierarchy(menuMapper.toMenuItemResponseList(allMenus));
    }

    @Override
    @Transactional
    public List<UserMenuResponseDto> updateUserMenuPermissions(Long userId, UserMenuUpdateDto updateDto) {
        log.info("Updating menu permissions for userId={}, count={}", userId, updateDto.getMenuPermissions().size());
        UserEntity user = getUserById(userId);

        for (MenuPermissionUpdateDto permDto : updateDto.getMenuPermissions()) {
            MenuItemEntity menuItem = getMenuItemById(permDto.getMenuId());

            Optional<MenuPermissionEntity> existing = menuPermissionRepository
                    .findByUserIdAndMenuItemIdAndStatus(userId, permDto.getMenuId(), Status.ACTIVE);

            if (existing.isPresent()) {
                MenuPermissionEntity perm = existing.get();
                perm.setCanView(permDto.getCanView() != null ? permDto.getCanView() : false);
                menuPermissionRepository.save(perm);
            } else {
                MenuPermissionEntity perm = new MenuPermissionEntity();
                perm.setUser(user);
                perm.setMenuItem(menuItem);
                perm.setCanView(permDto.getCanView() != null ? permDto.getCanView() : false);
                perm.setDisplayOrder(menuItem.getDisplayOrder());
                perm.setStatus(Status.ACTIVE);
                menuPermissionRepository.save(perm);
            }
        }

        return getAllMenusWithPermissions(userId);
    }

    @Override
    @Transactional
    public List<UserMenuResponseDto> resetUserMenusToDefault(Long userId) {
        log.info("Resetting menu permissions to default for userId={}", userId);
        UserEntity user = getUserById(userId);

        List<MenuPermissionEntity> userPermissions = menuPermissionRepository
                .findByUserIdAndStatus(userId, Status.ACTIVE);
        userPermissions.forEach(p -> p.setStatus(Status.DELETED));
        if (!userPermissions.isEmpty()) {
            menuPermissionRepository.saveAll(userPermissions);
        }

        initializeUserPermissions(user);
        return getAllMenusWithPermissions(userId);
    }

    @Override
    @Transactional
    public void initializeMenuPermissionsForNewUser(Long userId) {
        log.info("Initializing menu permissions for new userId={}", userId);
        UserEntity user = getUserById(userId);

        List<MenuPermissionEntity> existing = menuPermissionRepository
                .findByUserIdAndStatus(userId, Status.ACTIVE);
        if (!existing.isEmpty()) return;

        initializeUserPermissions(user);
    }

    @Override
    @Transactional
    public List<UserMenuResponseDto> refreshUserMenuPermissionsAfterRoleChange(Long userId) {
        log.info("Refreshing menu permissions after role change for userId={}", userId);
        UserEntity user = getUserById(userId);

        List<MenuPermissionEntity> existing = menuPermissionRepository
                .findByUserIdAndStatus(userId, Status.ACTIVE);
        existing.forEach(p -> p.setStatus(Status.DELETED));
        if (!existing.isEmpty()) {
            menuPermissionRepository.saveAll(existing);
        }

        initializeUserPermissions(user);
        return getAllMenusWithPermissions(userId);
    }

    @Override
    @Transactional
    public MenuItemResponseDto createMenuItem(MenuCreateDto createDto) {
        log.info("Creating menu item with code={}", createDto.getCode());
        if (menuItemRepository.existsByCodeAndStatus(createDto.getCode(), Status.ACTIVE)) {
            log.warn("Duplicate menu code={} already exists", createDto.getCode());
            throw new RuntimeException("Menu code '" + createDto.getCode() + "' already exists");
        }

        MenuItemEntity menuItem = new MenuItemEntity();
        menuItem.setCode(createDto.getCode());
        menuItem.setTitle(createDto.getTitle());
        menuItem.setRoute(createDto.getRoute());
        menuItem.setIcon(createDto.getIcon());
        menuItem.setIsParent(createDto.getIsParent() != null ? createDto.getIsParent() : false);
        menuItem.setStatus(Status.ACTIVE);

        if (createDto.getParentId() != null) {
            menuItem.setParent(getMenuItemById(createDto.getParentId()));
        }

        if (createDto.getDisplayOrder() != null) {
            menuItem.setDisplayOrder(createDto.getDisplayOrder());
        } else {
            Integer maxOrder = createDto.getParentId() != null
                    ? menuItemRepository.getMaxDisplayOrderForChildren(createDto.getParentId(), Status.ACTIVE)
                    : menuItemRepository.getMaxDisplayOrderForParents(Status.ACTIVE);
            menuItem.setDisplayOrder((maxOrder != null ? maxOrder : 0) + 1);
        }

        MenuItemEntity saved = menuItemRepository.save(menuItem);
        log.info("Menu item created successfully. id={}, code={}", saved.getId(), saved.getCode());
        assignNewMenuToAllUsers(saved);
        return menuMapper.toMenuItemResponse(saved);
    }

    @Override
    @Transactional
    public MenuItemResponseDto updateMenuItem(Long menuId, MenuUpdateDto updateDto) {
        log.info("Updating menu item id={}", menuId);
        MenuItemEntity menuItem = getMenuItemById(menuId);

        if (updateDto.getTitle() != null) menuItem.setTitle(updateDto.getTitle());
        if (updateDto.getRoute() != null) menuItem.setRoute(updateDto.getRoute());
        if (updateDto.getIcon() != null) menuItem.setIcon(updateDto.getIcon());
        if (updateDto.getIsParent() != null) menuItem.setIsParent(updateDto.getIsParent());
        if (updateDto.getDisplayOrder() != null) menuItem.setDisplayOrder(updateDto.getDisplayOrder());
        if (updateDto.getParentId() != null) menuItem.setParent(getMenuItemById(updateDto.getParentId()));

        MenuItemResponseDto result = menuMapper.toMenuItemResponse(menuItemRepository.save(menuItem));
        log.info("Menu item id={} updated successfully", menuId);
        return result;
    }

    @Override
    @Transactional
    public MenuItemResponseDto deleteMenuItem(Long menuId) {
        log.info("Deleting menu item id={}", menuId);
        MenuItemEntity menuItem = getMenuItemById(menuId);
        menuItem.setStatus(Status.DELETED);

        List<MenuItemEntity> children = menuItemRepository
                .findChildMenusByParentIdAndStatus(menuId, Status.ACTIVE);
        children.forEach(c -> c.setStatus(Status.DELETED));

        menuItemRepository.save(menuItem);
        if (!children.isEmpty()) menuItemRepository.saveAll(children);

        softDeleteMenuPermissions(menuId);
        children.forEach(c -> softDeleteMenuPermissions(c.getId()));

        log.info("Menu item id={} deleted successfully", menuId);
        return menuMapper.toMenuItemResponse(menuItem);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private UserEntity getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> {
            log.error("User not found with ID: {}", userId);
            return new NotFoundException("User not found with ID: " + userId);
        });
    }

    private MenuItemEntity getMenuItemById(Long menuId) {
        return menuItemRepository.findById(menuId).orElseThrow(() -> {
            log.error("Menu item not found with ID: {}", menuId);
            return new NotFoundException("Menu item not found with ID: " + menuId);
        });
    }

    private void initializeUserPermissions(UserEntity user) {
        List<MenuItemEntity> allMenus = menuItemRepository.findByStatusOrderByDisplayOrderAscIdAsc(Status.ACTIVE);
        Set<RoleEnum> userRoles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        List<MenuPermissionEntity> permissions = new ArrayList<>();
        for (MenuItemEntity menu : allMenus) {
            MenuPermissionEntity perm = new MenuPermissionEntity();
            perm.setUser(user);
            perm.setMenuItem(menu);
            perm.setCanView(menuPermissionConfig.hasAnyRoleAccess(menu.getCode(), userRoles));
            perm.setDisplayOrder(menu.getDisplayOrder());
            perm.setStatus(Status.ACTIVE);
            permissions.add(perm);
        }
        menuPermissionRepository.saveAll(permissions);
    }

    private void assignNewMenuToAllUsers(MenuItemEntity newMenu) {
        int pageSize = 500;
        int pageNo = 0;
        List<MenuPermissionEntity> permissions = new ArrayList<>();

        Page<UserEntity> page;
        do {
            page = userRepository.findAll(PageRequest.of(pageNo++, pageSize));
            for (UserEntity user : page.getContent()) {
                Set<RoleEnum> roles = user.getRoles().stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet());
                MenuPermissionEntity perm = new MenuPermissionEntity();
                perm.setUser(user);
                perm.setMenuItem(newMenu);
                perm.setCanView(menuPermissionConfig.hasAnyRoleAccess(newMenu.getCode(), roles));
                perm.setDisplayOrder(newMenu.getDisplayOrder());
                perm.setStatus(Status.ACTIVE);
                permissions.add(perm);
            }
            if (permissions.size() >= 500) {
                menuPermissionRepository.saveAll(permissions);
                permissions.clear();
            }
        } while (!page.isLast());

        if (!permissions.isEmpty()) {
            menuPermissionRepository.saveAll(permissions);
        }
    }

    private void softDeleteMenuPermissions(Long menuId) {
        List<MenuPermissionEntity> permissions = menuPermissionRepository
                .findByMenuItemIdAndStatus(menuId, Status.ACTIVE);
        permissions.forEach(p -> p.setStatus(Status.DELETED));
        if (!permissions.isEmpty()) menuPermissionRepository.saveAll(permissions);
    }

    private Map<Long, MenuPermissionEntity> getUserCustomPermissions(Long userId) {
        return menuPermissionRepository.findByUserIdAndStatus(userId, Status.ACTIVE).stream()
                .collect(Collectors.toMap(p -> p.getMenuItem().getId(), p -> p));
    }

    private UserMenuResponseDto buildUserMenuResponseWithPermission(MenuItemEntity menu,
                                                                    Map<Long, MenuPermissionEntity> userPermissions) {
        UserMenuResponseDto dto = menuMapper.toUserMenuResponse(menu);
        MenuPermissionEntity perm = userPermissions.get(menu.getId());
        if (perm != null) {
            dto.setCanView(perm.getCanView());
            dto.setIsCustomized(true);
        } else {
            dto.setCanView(false);
            dto.setIsCustomized(false);
        }
        return dto;
    }

    private List<MenuItemResponseDto> buildMenuHierarchy(List<MenuItemResponseDto> flatMenus) {
        Map<Long, MenuItemResponseDto> menuMap = flatMenus.stream()
                .collect(Collectors.toMap(MenuItemResponseDto::getId, m -> m));
        List<MenuItemResponseDto> roots = new ArrayList<>();
        for (MenuItemResponseDto menu : flatMenus) {
            if (menu.getParentId() == null) {
                roots.add(menu);
            } else {
                MenuItemResponseDto parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
                    parent.getChildren().add(menu);
                }
            }
        }
        return roots;
    }

    private List<UserMenuResponseDto> buildUserMenuHierarchy(List<UserMenuResponseDto> flatMenus) {
        Map<Long, UserMenuResponseDto> menuMap = flatMenus.stream()
                .collect(Collectors.toMap(UserMenuResponseDto::getId, m -> m));
        List<UserMenuResponseDto> roots = new ArrayList<>();
        for (UserMenuResponseDto menu : flatMenus) {
            if (menu.getParentId() == null) {
                roots.add(menu);
            } else {
                UserMenuResponseDto parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) parent.setChildren(new ArrayList<>());
                    parent.getChildren().add(menu);
                }
            }
        }
        return roots;
    }

    private List<UserMenuResponseDto> filterViewableMenus(List<UserMenuResponseDto> menus) {
        return menus.stream()
                .filter(menu -> {
                    if (!menu.getCanView()) return false;
                    if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
                        menu.setChildren(filterViewableMenus(menu.getChildren()));
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }
}
