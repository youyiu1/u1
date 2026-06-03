/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity.system;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_category")
public class Category {
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;
    private String name;
    private String icon;
    private String type;
    private String status;
    @TableField("sort_order")
    private Integer sortOrder;
}
