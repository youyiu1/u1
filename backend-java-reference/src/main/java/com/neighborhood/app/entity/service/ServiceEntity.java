package com.neighborhood.app.entity.service;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.neighborhood.app.handler.MySqlJsonTypeHandler;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;
import org.apache.ibatis.type.JdbcType;

/** 文件作用：服务实体。 */
@Data
@TableName("t_service")
public class ServiceEntity {
    @TableId(type = IdType.ASSIGN_ID)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal price;
    private String sellerId;
    private Double rating;
    private Integer reviews;
    private String distance;
    private String unit;
    private String highlights;
    private String status;
    private String rejectReason;
    private Double latitude;
    private Double longitude;
    @TableField(value = "images", typeHandler = MySqlJsonTypeHandler.class, jdbcType = JdbcType.VARCHAR)
    private List<String> images;
}
