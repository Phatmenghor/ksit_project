package com.menghor.ksit.feature.menu.service;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.feature.menu.dto.request.MenuCreateDto;
import com.menghor.ksit.feature.menu.dto.request.MenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.request.UserMenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.response.MenuItemResponseDto;
import com.menghor.ksit.feature.menu.dto.response.UserMenuResponseDto;

import java.util.List;

public interface MenuService {

    // ─── Frontend: menu display ───────────────────────────────────────────────

    List<UserMenuResponseDto> getAllMenusWithPermissions(Long userId);

    List<UserMenuResponseDto> getUserViewableMenus(Long userId);

    List<UserMenuResponseDto> getMenusByRole(RoleEnum role);

    List<MenuItemResponseDto> getAllMenuItems();

    // ─── Frontend: permission management ─────────────────────────────────────

    List<UserMenuResponseDto> updateUserMenuPermissions(Long userId, UserMenuUpdateDto updateDto);

    List<UserMenuResponseDto> resetUserMenusToDefault(Long userId);

    // ─── Backend: called by other services ───────────────────────────────────

    void initializeMenuPermissionsForNewUser(Long userId);

    List<UserMenuResponseDto> refreshUserMenuPermissionsAfterRoleChange(Long userId);

    // ─── Admin: menu item management ─────────────────────────────────────────

    MenuItemResponseDto createMenuItem(MenuCreateDto createDto);

    MenuItemResponseDto updateMenuItem(Long menuId, MenuUpdateDto updateDto);

    MenuItemResponseDto deleteMenuItem(Long menuId);
}
