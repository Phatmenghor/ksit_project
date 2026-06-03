package com.menghor.ksit.feature.menu.models;

import com.menghor.ksit.enumations.Status;
import com.menghor.ksit.utils.database.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "menu_items", indexes = {
    @Index(name = "idx_menu_item_code", columnList = "code"),
    @Index(name = "idx_menu_item_status", columnList = "status"),
    @Index(name = "idx_menu_item_parent_id", columnList = "parent_id"),
    @Index(name = "idx_menu_item_is_parent", columnList = "is_parent"),
    @Index(name = "idx_menu_item_display_order", columnList = "display_order")
})
public class MenuItemEntity extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String title;

    private String route;

    private String icon;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "is_parent")
    private Boolean isParent = false;

    // Self-referencing relationship for parent-child
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private MenuItemEntity parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<MenuItemEntity> children = new ArrayList<>();

    // Permissions for this menu item
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuPermissionEntity> permissions = new ArrayList<>();
}