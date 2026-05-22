/**
 * MySQL JSON 字段专用 TypeHandler
 * 通用处理 List<String> 类型的 JSON 数组字段
 *
 * @license Apache-2.0
 */
package com.neighborhood.app.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.TypeHandler;

import java.sql.Blob;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * MySQL JSON 列处理器，用于处理 List<String> 类型的 JSON 数组字段
 * <p>
 * 使用方式：
 * 在实体类字段上添加注解 @TableField(typeHandler = MySqlJsonTypeHandler.class)
 * <p>
 * 优势：
 * 1. 直接实现 TypeHandler 接口，完全可控
 * 2. 通用的 Jackson JSON 解析，稳定可靠
 * 3. 自动处理空值和异常情况
 * 4. 兼容所有 MyBatis-Plus 版本
 */
public class MySqlJsonTypeHandler extends BaseTypeHandler<List<String>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
        if (parameter == null || parameter.isEmpty()) {
            ps.setString(i, "[]");
        } else {
            try {
                ps.setString(i, MAPPER.writeValueAsString(parameter));
            } catch (JsonProcessingException e) {
                ps.setString(i, "[]");
            }
        }
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        // MySQL JSON 列可能被当作 BLOB 返回
        Object obj = rs.getObject(columnName);
        System.out.println("=== MySqlJsonTypeHandler getNullableResult ===");
        System.out.println("columnName: " + columnName);
        System.out.println("obj class: " + (obj != null ? obj.getClass().getName() : "null"));
        System.out.println("obj value: " + obj);
        List<String> result = parseObject(obj);
        System.out.println("result: " + result);
        return result;
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Object obj = rs.getObject(columnIndex);
        System.out.println("=== MySqlJsonTypeHandler getNullableResult(int) ===");
        System.out.println("columnIndex: " + columnIndex);
        System.out.println("obj class: " + (obj != null ? obj.getClass().getName() : "null"));
        System.out.println("obj value: " + obj);
        return parseObject(obj);
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Object obj = cs.getObject(columnIndex);
        return parseObject(obj);
    }

    private List<String> parseObject(Object obj) {
        if (obj == null) {
            return new ArrayList<>();
        }
        String json;
        if (obj instanceof String) {
            json = (String) obj;
        } else if (obj instanceof Blob) {
            // Blob 类型转 String
            try {
                Blob blob = (Blob) obj;
                byte[] bytes = blob.getBytes(1, (int) blob.length());
                json = new String(bytes);
            } catch (SQLException e) {
                json = null;
            }
        } else if (obj instanceof byte[]) {
            json = new String((byte[]) obj);
        } else {
            json = obj.toString();
        }
        return parseJson(json);
    }

    private List<String> parseJson(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            List<String> result = new ArrayList<>();
            ArrayNode arrayNode = (ArrayNode) MAPPER.readTree(json);
            for (var node : arrayNode) {
                result.add(node.asText());
            }
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}