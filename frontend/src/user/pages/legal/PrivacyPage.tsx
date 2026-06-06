import React from 'react';

const PRIVACY_SECTIONS = [
  {
    title: '信息收集',
    content: '平台会在登录、注册、发布、预约、消息通知和资料编辑等场景中收集你主动提交的信息，例如昵称、邮箱、头像、联系方式、地区和互动记录。',
  },
  {
    title: '使用目的',
    content: '这些信息主要用于账号认证、内容展示、服务预约、消息通知、互动推荐、风控识别与基础运维保障，不会超出平台正常业务范围随意使用。',
  },
  {
    title: '信息展示',
    content: '你发布的公开资料、动态、商品和服务信息可能会展示给其他用户。隐私可见范围、动态可见范围和位置展示等选项可在个人设置中调整。',
  },
  {
    title: '安全保护',
    content: '平台会采取合理的鉴权、缓存、日志和存储保护措施降低泄露风险，但你也应避免在公开内容中直接披露敏感隐私或支付信息。',
  },
  {
    title: '用户权利',
    content: '你可以通过个人资料与隐私设置页面更新或调整相关信息；如不再使用平台，可退出登录并停止继续提交新内容。',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[900px] px-6 py-14 md:px-10 md:py-20">
        <div className="mb-10">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-primary">Privacy</p>
          <h1 className="text-3xl font-black tracking-tight text-ink md:text-4xl">隐私政策</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            本页面用于说明同城生活平台如何收集、使用、展示和保护与你相关的信息。
          </p>
        </div>

        <div className="space-y-5">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title} className="rounded-[28px] border border-hairline bg-stone-50 p-6 md:p-8">
              <h2 className="mb-3 text-lg font-black text-ink">{section.title}</h2>
              <p className="text-sm leading-7 text-secondary">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
