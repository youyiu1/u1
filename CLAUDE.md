# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 椤圭洰姒傝堪

鍚屽煄鐢熸椿绀惧尯骞冲彴锛?- **鍓嶇**: React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router v7
- **鍚庣**: Spring Boot 3.2 + MyBatis-Plus + MySQL + Redis

## 寮€鍙戝懡浠?
### 鍓嶇
```bash
cd frontend && npm install && npm run dev
```

### 鍚庣
```bash
cd backend-java-reference && mvn spring-boot:run
```

### 鏁版嵁搴?```bash
mysql -u root -proot neighborhood_db < sql/init.sql
```

## 鏋舵瀯璇存槑

### 鍓嶇
- `src/App.tsx` - 涓昏矾鐢遍厤缃?- `src/pages/` - 椤甸潰缁勪欢
- `src/components/` - 鎸夋ā鍧楃粍缁囷細chat銆乧ommon銆乭ome銆乴ayout銆乸rofile銆乸ublish
- `src/context/` - AuthContext銆丆hatContext銆丯otificationContext銆乀oastContext銆乽seAuthCheck
- `src/services/api.ts` - 缁熶竴 API 鍏ュ彛
- `src/types.ts` - 绫诲瀷瀹氫箟

### 鍚庣
`src/main/java/com/neighborhood/app/` 涓嬬殑鍒嗗眰鏋舵瀯锛?- `controller/` - REST 鎺у埗鍣?- `service/` - 涓氬姟閫昏緫锛坕mpl 瀹炵幇绫伙級
- `mapper/` - MyBatis 鏁版嵁璁块棶
- `entity/` - 鏁版嵁搴撴ā鍨?- `common/` - `Result<T>` 缁熶竴鍝嶅簲灏佽
- `config/` - RedisConfig銆乄ebConfig銆丣acksonConfig
- `interceptor/` - AuthInterceptor锛圝WT 璁よ瘉锛?
### 瀹炰綋 ID 璁捐
- String 绫诲瀷 ID锛歚@TableId(type = IdType.ASSIGN_ID)`
- Long 绫诲瀷 ID锛氶渶娣诲姞 `@JsonSerialize(using = ToStringSerializer.class)` 闃叉绮惧害涓㈠け

### 缂撳瓨绛栫暐
鐢ㄦ埛 30鍒嗛挓锛屽垪琛?10鍒嗛挓锛岃鎯?15鍒嗛挓锛岀儹鐐?5鍒嗛挓

## API 璁捐

鍚庣杩愯鍦?8080 绔彛銆傜粺涓€鍝嶅簲鏍煎紡锛?```json
{"success": true, "message": "success", "data": {...}}
```

### 璁よ瘉鏈哄埗
JWT + Redis 鍙岄獙璇侊紝AuthInterceptor 鎷︽埅 `/api/**`锛堢櫥褰?娉ㄥ唽闄ゅ锛?
## 閲嶈瑙勫垯

**姣忔瀹屾垚浠诲姟鐢ㄤ腑鏂囨彁浜ゅ埌git**
**姣忔娣诲姞鎺ュ彛锛屾帴鍙ｆ坊鍔犱腑鏂囨敞閲?*

## 閰嶇疆

- 鍓嶇锛歚.env.local` 閰嶇疆 `GEMINI_API_KEY`
- 鍚庣锛歚application.yml` 涓?`jdbc:mysql://localhost:3306/neighborhood_db`锛岀敤鎴峰悕/瀵嗙爜 `root/root`