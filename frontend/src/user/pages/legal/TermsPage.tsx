import React from 'react';

const TERMS_SECTIONS = [
  {
    title: '服务说明',
    content: '同城生活为用户提供生活服务、闲置交易、社区动态和站内沟通能力。用户发布、预约、收藏和互动时，应保证信息真实、合法且不侵犯他人权益。',
  },
  {
    title: '账号责任',
    content: '用户应妥善保管账号、验证码和登录信息，不得冒用他人身份，不得利用平台从事刷单、诈骗、恶意营销或其他扰乱社区秩序的行为。',
  },
  {
    title: '内容规范',
    content: '发布的商品、服务、图片、评论和私信内容不得包含违法、侵权、低俗、骚扰、泄露隐私或误导交易的信息。平台有权对违规内容进行删除、限制或封禁处理。',
  },
  {
    title: '交易与预约',
    content: '闲置交易和服务预约由用户双方自主协商确认，平台提供信息展示、消息通知和记录留存能力，但用户仍需自行核验对方身份、商品情况和履约细节。',
  },
  {
    title: '其他',
    content: '继续使用平台即视为同意遵守本协议。平台会根据业务变化进行必要更新，重大调整会通过站内方式提示。',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[900px] px-6 py-14 md:px-10 md:py-20">
        <div className="mb-10">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-primary">Agreement</p>
          <h1 className="text-3xl font-black tracking-tight text-ink md:text-4xl">服务协议</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            本协议用于说明你在使用同城生活平台时的基础权利义务、内容规范与交易预约原则。
          </p>
        </div>

        <div className="space-y-5">
          {TERMS_SECTIONS.map((section) => (
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
