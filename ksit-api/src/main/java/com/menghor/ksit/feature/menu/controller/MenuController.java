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
        UserEntity currentUser = securityUtils.getCurrentUser();
        log.debug("GET /my-menus for user id={}", currentUser.getId());
        return ApiResponse.success("User menus retrieved successfully",
                menuService.getAllMenusWithPermissions(currentUser.getId()));
    }

    @GetMapping("/my-menus/viewable")
    public ApiResponse<List<UserMenuResponseDto>> getMyViewableMenus() {
        UserEntity currentUser = securityUtils.getCurrentUser();
        log.debug("GET /my-menus/viewable for user id={}", currentUser.getId());
        return ApiResponse.success("User viewable menus retrieved successfully",
                menuService.getUserViewableMenus(currentUser.getId()));
    }

    @PutMapping("/my-menus/permissions")
    public ApiResponse<List<UserMenuResponseDto>> updateMyMenuPermissions(
            @Valid @RequestBody UserMenuUpdateDto updateDto) {
        UserEntity currentUser = securityUtils.getCurrentUser();
        return ApiResponse.success("Your menu permissions updated successfully",
                menuService.updateUserMenuPermissions(currentUser.getId(), updateDto));
    }

    @PostMapping("/my-menus/reset")
    public ApiResponse<List<UserMenuResponseDto>> resetMyMenusToDefault() {
        UserEntity currentUser = securityUtils.getCurrentUser();
        return ApiResponse.success("Your menu permissions reset to defaults successfully",
                menuService.resetUserMenusToDefault(currentUser.getId()));
    }

    // ─── Admin user-management endpoints ─────────────────────────────────────

    @GetMapping("/users/{userId}")
    public ApiResponse<List<UserMenuResponseDto>> getUserMenus(@PathVariable Long userId) {
        return ApiResponse.success("User menus retrieved successfully",
                menuService.getAllMenusWithPermissions(userId));
    }

    @PutMapping("/users/{userId}/permissions")
    public ApiResponse<List<UserMenuResponseDto>> updateUserMenuPermissions(
            @PathVariable Long userId,
            @Valid @RequestBody UserMenuUpdateDto updateDto) {
        return ApiResponse.success("Menu permissions updated successfully",
                menuService.updateUserMenuPermissions(userId, updateDto));
    }

    @PostMapping("/users/{userId}/reset")
    public ApiResponse<List<UserMenuResponseDto>> resetUserMenusToDefault(@PathVariable Long userId) {
        return ApiResponse.success("Menu permissions reset to defaults successfully",
                menuService.resetUserMenusToDefault(userId));
    }

    // ─── Menu structure endpoints ─────────────────────────────────────────────

    @GetMapping("/all")
    public ApiResponse<List<MenuItemResponseDto>> getAllMenuItems() {
        return ApiResponse.success("All menu items retrieved successfully",
                menuService.getAllMenuItems());
    }

    @GetMapping("/roles/{role}")
    public ApiResponse<List<UserMenuResponseDto>> getMenusByRole(@PathVariable RoleEnum role) {
        return ApiResponse.success("Role menus retrieved successfully",
                menuService.getMenusByRole(role));
    }

    // ─── Menu item management (admin) ─────────────────────────────────────────

    @PostMapping("/items")
    public ApiResponse<MenuItemResponseDto> createMenuItem(@Valid @RequestBody MenuCreateDto createDto) {
        return ApiResponse.success("Menu item created successfully",
                menuService.createMenuItem(createDto));
    }

    @PutMapping("/items/{menuId}")
    public ApiResponse<MenuItemResponseDto> updateMenuItem(
            @PathVariable Long menuId,
            @Valid @RequestBody MenuUpdateDto updateDto) {
        return ApiResponse.success("Menu item updated successfully",
                menuService.updateMenuItem(menuId, updateDto));
    }

    @DeleteMapping("/items/{menuId}")
    public ApiResponse<MenuItemResponseDto> deleteMenuItem(@PathVariable Long menuId) {
        return ApiResponse.success("Menu item deleted successfully",
                menuService.deleteMenuItem(menuId));
    }
}
