package com.menghor.ksit.feature.menu.controller;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.exceptoins.response.ApiResponse;
import com.menghor.ksit.feature.auth.models.UserEntity;
import com.menghor.ksit.feature.menu.dto.request.MenuCreateDto;
import com.menghor.ksit.feature.menu.dto.request.MenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.request.UserMenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.response.MenuItemResponseDto;
import com.menghor.ksit.feature.menu.dto.response.UserMenuResponseDto;
import com.menghor.ksit.feature.menu.service.MenuService;
import com.menghor.ksit.utils.database.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Menu & Permissions", description = "Manage role-based menu access permissions")
@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
@Slf4j
public class MenuController {

    private final MenuService menuService;
    private final SecurityUtils securityUtils;

    // ─── Current user endpoints ───────────────────────────────────────────────

    @GetMapping("/my-menus")
    public ApiResponse<List<UserMenuResponseDto>> getMyMenus() {
        log.info("Get my menus request received");
        UserEntity currentUser = securityUtils.getCurrentUser();
        List<UserMenuResponseDto> menus = menuService.getAllMenusWithPermissions(currentUser.getId());
        log.info("My menus retrieved successfully. userId={}", currentUser.getId());
        return ApiResponse.success("User menus retrieved successfully", menus);
    }

    @GetMapping("/my-menus/viewable")
    public ApiResponse<List<UserMenuResponseDto>> getMyViewableMenus() {
        log.info("Get my viewable menus request received");
        UserEntity currentUser = securityUtils.getCurrentUser();
        List<UserMenuResponseDto> menus = menuService.getUserViewableMenus(currentUser.getId());
        log.info("My viewable menus retrieved successfully. userId={}", currentUser.getId());
        return ApiResponse.success("User viewable menus retrieved successfully", menus);
    }

    @PutMapping("/my-menus/permissions")
    public ApiResponse<List<UserMenuResponseDto>> updateMyMenuPermissions(
            @Valid @RequestBody UserMenuUpdateDto updateDto) {
        log.info("Update my menu permissions request received");
        UserEntity currentUser = securityUtils.getCurrentUser();
        List<UserMenuResponseDto> menus = menuService.updateUserMenuPermissions(currentUser.getId(), updateDto);
        log.info("My menu permissions updated successfully. userId={}", currentUser.getId());
        return ApiResponse.success("Your menu permissions updated successfully", menus);
    }

    @PostMapping("/my-menus/reset")
    public ApiResponse<List<UserMenuResponseDto>> resetMyMenusToDefault() {
        log.info("Reset my menu permissions request received");
        UserEntity currentUser = securityUtils.getCurrentUser();
        List<UserMenuResponseDto> menus = menuService.resetUserMenusToDefault(currentUser.getId());
        log.info("My menu permissions reset successfully. userId={}", currentUser.getId());
        return ApiResponse.success("Your menu permissions reset to defaults successfully", menus);
    }

    // ─── Admin user-management endpoints ─────────────────────────────────────

    @GetMapping("/users/{userId}")
    public ApiResponse<List<UserMenuResponseDto>> getUserMenus(@PathVariable Long userId) {
        log.info("Get user menus userId={} request received", userId);
        List<UserMenuResponseDto> menus = menuService.getAllMenusWithPermissions(userId);
        log.info("User menus retrieved successfully. userId={}", userId);
        return ApiResponse.success("User menus retrieved successfully", menus);
    }

    @PutMapping("/users/{userId}/permissions")
    public ApiResponse<List<UserMenuResponseDto>> updateUserMenuPermissions(
            @PathVariable Long userId,
            @Valid @RequestBody UserMenuUpdateDto updateDto) {
        log.info("Update user menu permissions userId={} request received", userId);
        List<UserMenuResponseDto> menus = menuService.updateUserMenuPermissions(userId, updateDto);
        log.info("User menu permissions updated successfully. userId={}", userId);
        return ApiResponse.success("Menu permissions updated successfully", menus);
    }

    @PostMapping("/users/{userId}/reset")
    public ApiResponse<List<UserMenuResponseDto>> resetUserMenusToDefault(@PathVariable Long userId) {
        log.info("Reset user menu permissions userId={} request received", userId);
        List<UserMenuResponseDto> menus = menuService.resetUserMenusToDefault(userId);
        log.info("User menu permissions reset successfully. userId={}", userId);
        return ApiResponse.success("Menu permissions reset to defaults successfully", menus);
    }

    // ─── Menu structure endpoints ─────────────────────────────────────────────

    @GetMapping("/all")
    public ApiResponse<List<MenuItemResponseDto>> getAllMenuItems() {
        log.info("Get all menu items request received");
        List<MenuItemResponseDto> menus = menuService.getAllMenuItems();
        log.info("All menu items retrieved successfully");
        return ApiResponse.success("All menu items retrieved successfully", menus);
    }

    @GetMapping("/roles/{role}")
    public ApiResponse<List<UserMenuResponseDto>> getMenusByRole(@PathVariable RoleEnum role) {
        log.info("Get menus by role={} request received", role);
        List<UserMenuResponseDto> menus = menuService.getMenusByRole(role);
        log.info("Menus by role={} retrieved successfully", role);
        return ApiResponse.success("Role menus retrieved successfully", menus);
    }

    // ─── Menu item management (admin) ─────────────────────────────────────────

    @PostMapping("/items")
    public ApiResponse<MenuItemResponseDto> createMenuItem(@Valid @RequestBody MenuCreateDto createDto) {
        log.info("Create menu item request received");
        MenuItemResponseDto menu = menuService.createMenuItem(createDto);
        log.info("Menu item created successfully. id={}", menu.getId());
        return ApiResponse.success("Menu item created successfully", menu);
    }

    @PutMapping("/items/{menuId}")
    public ApiResponse<MenuItemResponseDto> updateMenuItem(
            @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateDto updateDto) {
        log.info("Update menu item id={} request received", menuId);
        MenuItemResponseDto menu = menuService.updateMenuItem(menuId, updateDto);
        log.info("Menu item id={} updated successfully", menuId);
        return ApiResponse.success("Menu item updated successfully", menu);
    }

    @DeleteMapping("/items/{menuId}")
    public ApiResponse<MenuItemResponseDto> deleteMenuItem(@PathVariable Long menuId) {
        log.info("Delete menu item id={} request received", menuId);
        MenuItemResponseDto menu = menuService.deleteMenuItem(menuId);
        log.info("Menu item id={} deleted successfully", menuId);
        return ApiResponse.success("Menu item deleted successfully", menu);
    }
}
