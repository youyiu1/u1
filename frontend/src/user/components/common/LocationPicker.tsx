/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, MapPin, ChevronDown, Check } from 'lucide-react';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { name: string; lat: number; lng: number }) => void;
}

const provinces = [
  { name: '北京市', cities: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '顺义区', '大兴区', '昌平区', '房山区', '门头沟区', '怀柔区', '平谷区', '密云区', '延庆区'] },
  { name: '上海市', cities: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区', '嘉定区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'] },
  { name: '天津市', cities: ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'] },
  { name: '重庆市', cities: ['渝中区', '万州区', '涪陵区', '渝北区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '巴南区', '黔江区', '长寿区', '合川区', '永川区', '南川区', '大足区'] },
  { name: '广东省', cities: ['广州市', '深圳市', '珠海市', '东莞市', '佛山市', '中山市', '惠州市', '汕头市', '湛江市', '江门市', '茂名市', '肇庆市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '潮州市', '揭阳市', '云浮市'] },
  { name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'] },
  { name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '南通市', '徐州市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'] },
  { name: '四川省', cities: ['成都市', '绵阳市', '自贡市', '攀枝花市', '泸州市', '德阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'] },
  { name: '湖北省', cities: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆州市', '荆门市', '孝感市', '黄冈市', '咸宁市', '随州市', '恩施市', '仙桃市', '潜江市', '天门市'] },
  { name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '吉首市'] },
  { name: '山东省', cities: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市', '莱芜市'] },
  { name: '河南省', cities: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'] },
  { name: '辽宁省', cities: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'] },
  { name: '黑龙江省', cities: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市'] },
  { name: '福建省', cities: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'] },
  { name: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'] },
  { name: '河北省', cities: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'] },
  { name: '山西省', cities: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'] },
  { name: '陕西省', cities: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'] },
  { name: '吉林省', cities: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延吉市'] },
  { name: '江西省', cities: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'] },
  { name: '云南省', cities: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄市', '大理市', '个旧市', '文山市', '景洪市'] },
  { name: '贵州省', cities: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '凯里市', '都匀市', '兴义市'] },
  { name: '甘肃省', cities: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市'] },
  { name: '青海省', cities: ['西宁市', '海东市', '格尔木市', '德令哈市'] },
  { name: '内蒙古', cities: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '锡林浩特市', '临河市'] },
  { name: '广西', cities: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'] },
  { name: '海南省', cities: ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市'] },
  { name: '宁夏', cities: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'] },
  { name: '西藏', cities: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市'] },
  { name: '新疆', cities: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '阿克苏市', '喀什市', '和田市', '昌吉市', '博乐市', '库尔勒市', '伊宁市', '奎屯市', '塔城市', '阿勒泰市'] },
  { name: '台湾省', cities: ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉义市'] },
  { name: '香港', cities: ['中西区', '东区', '南区', '湾仔区', '九龙城区', '观塘区', '荃湾区', '元朗区', '北区', '大埔区', '西贡区', '沙田区', '葵青区', '离岛区'] },
  { name: '澳门', cities: ['花地玛堂区', '圣安多尼堂区', '大堂区', '望德堂区', '风顺堂区', '嘉模堂区', '圣方济各堂区'] },
];

export function LocationPicker({ isOpen, onClose, onSelect }: LocationPickerProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'province' | 'city' | null>(null);

  const cities = provinces.find(p => p.name === selectedProvince)?.cities || [];

  const handleProvinceSelect = (pName: string) => {
    setSelectedProvince(pName);
    setSelectedCity(null);
    setOpenDropdown('city');
  };

  const handleCitySelect = (cName: string) => {
    setSelectedCity(cName);
    setOpenDropdown(null);
  };

  const handleConfirm = () => {
    if (selectedProvince && selectedCity) {
      onSelect({ name: `${selectedProvince} ${selectedCity}`, lat: 0, lng: 0 });
      setSelectedProvince(null);
      setSelectedCity(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* 顶部栏 */}
        <div className="flex items-center gap-3 p-4 border-b border-hairline">
          <button onClick={onClose} className="p-2 hover:bg-surface-soft rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-black text-ink">选择位置</h3>
          <div className="flex-1" />
          <button
            onClick={handleConfirm}
            disabled={!selectedProvince || !selectedCity}
            className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认
          </button>
        </div>

        {/* 选择器 */}
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            {/* 省份 */}
            <div className="flex-1">
              <label className="text-xs font-black text-muted uppercase tracking-wider mb-2 block">省份/直辖市</label>
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'province' ? null : 'province')}
                  className="w-full px-4 py-3 bg-surface-soft rounded-xl text-sm font-medium text-left flex items-center justify-between hover:bg-hairline transition-colors"
                >
                  <span className={selectedProvince ? 'text-ink' : 'text-muted'}>
                    {selectedProvince || '请选择省份'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>
              </div>
              {openDropdown === 'province' && (
                <div className="mt-2 bg-white border border-hairline rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {provinces.map((p, idx) => (
                    <button
                      key={`province-${p.name || 'empty'}-${idx}`}
                      onClick={() => handleProvinceSelect(p.name)}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-surface-soft transition-colors flex items-center justify-between"
                    >
                      <span>{p.name}</span>
                      {selectedProvince === p.name && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 城市 */}
            <div className="flex-1">
              <label className="text-xs font-black text-muted uppercase tracking-wider mb-2 block">城市/区县</label>
              <div className="relative">
                <button
                  onClick={() => {
                    if (selectedProvince) setOpenDropdown(openDropdown === 'city' ? null : 'city');
                  }}
                  disabled={!selectedProvince}
                  className="w-full px-4 py-3 bg-surface-soft rounded-xl text-sm font-medium text-left flex items-center justify-between hover:bg-hairline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={selectedCity ? 'text-ink' : 'text-muted'}>
                    {selectedCity || (selectedProvince ? '请选择城市' : '先选省份')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>
              </div>
              {openDropdown === 'city' && (
                <div className="mt-2 bg-white border border-hairline rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {cities.map((c, idx) => (
                    <button
                      key={`city-${c || 'empty'}-${idx}`}
                      onClick={() => handleCitySelect(c)}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-surface-soft transition-colors flex items-center justify-between"
                    >
                      <span>{c}</span>
                      {selectedCity === c && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 已选位置展示 */}
          {selectedProvince && selectedCity && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-primary">{selectedProvince} {selectedCity}</span>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="p-4 text-center text-xs text-muted border-t border-hairline">
          请先选择省份，再选择城市或区县
        </div>
      </div>
    </div>
  );
}
