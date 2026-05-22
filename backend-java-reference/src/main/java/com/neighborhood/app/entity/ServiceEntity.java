/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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
    @TableField("highlights")
    private String highlightsJson;
    @TableField("images")
    private String imagesJson;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public List<String> getImages() {
        if (imagesJson == null || imagesJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            JsonNode node = MAPPER.readTree(imagesJson);
            if (node.isArray()) {
                List<String> list = new ArrayList<>();
                for (JsonNode n : node) {
                    list.add(n.asText());
                }
                return list;
            }
        } catch (Exception e) {
            // ignore parse error
        }
        return new ArrayList<>();
    }

    public List<String> getHighlights() {
        if (highlightsJson == null || highlightsJson.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            JsonNode node = MAPPER.readTree(highlightsJson);
            if (node.isArray()) {
                List<String> list = new ArrayList<>();
                for (JsonNode n : node) {
                    list.add(n.asText());
                }
                return list;
            }
        } catch (Exception e) {
            // ignore parse error
        }
        return new ArrayList<>();
    }
}
