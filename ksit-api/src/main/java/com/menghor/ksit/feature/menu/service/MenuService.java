package com.menghor.ksit.feature.menu.service;

import com.menghor.ksit.enumations.RoleEnum;
import com.menghor.ksit.feature.menu.dto.request.MenuCreateDto;
import com.menghor.ksit.feature.menu.dto.request.MenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.request.UserMenuUpdateDto;
import com.menghor.ksit.feature.menu.dto.response.MenuItemResponseDto;
import com.menghor.ksit.feature.menu.dto.response.UserMenuResponseDto;

import java.util.List;

public interface MenuService {

    List<MenuItemResponseDto> getAllMenuItems();

    List<UserMenuResponseDto> getAllMenusWithPermissions(Long userId);

    List<UserMenuResponseDto> getMenusByRole(RoleEnum role);

    List<UserMenuResponseDto> updateUserMenuPermissions(Long userId, UserMenuUpdateDto updateDto);

    List<UserMenuResponseDto> getUserViewableMenus(Long userId);

    List<UserMenuResponseDto> resetUserMenusToDefault(Long userId);

    void initializeMenuPermissionsForNewUser(Long userId);

    List<UserMenuResponseDto> refreshUserMenuPermissionsAfterRoleChange(Long userId);

    void syncAllUserMenuPermissions();

    void updateAllUsersToNewPermissions();

    MenuItemResponseDto createMenuItem(MenuCreateDto createDto);

    MenuItemResponseDto updateMenuItem(Long menuId, MenuUpdateDto updateDto);

    MenuItemResponseDto deleteMenuItem(Long menuId);
}
