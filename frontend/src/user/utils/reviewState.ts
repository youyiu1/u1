type ReviewState = {
  status: string;
  label: string;
  reason: string;
  className: string;
};

type PendingOptions = {
  label?: string;
};

type RejectedOptions = {
  label?: string;
  fallbackReason?: string;
};

export function getPendingReviewState(status?: string, options: PendingOptions = {}): ReviewState | null {
  if (status !== 'pending') {
    return null;
  }

  return {
    status,
    label: options.label || '待平台审核',
    reason: '',
    className: 'bg-amber-50 text-amber-700 border border-amber-100',
  };
}

export function getRejectedReviewState(
  status?: string,
  rejectReason?: string,
  options: RejectedOptions = {}
): ReviewState | null {
  if (status !== 'removed' && status !== 'rejected') {
    return null;
  }

  return {
    status,
    label: options.label || '未通过审核',
    reason: rejectReason || options.fallbackReason || '请修改后重新提交',
    className: 'bg-rose-50 text-rose-700 border border-rose-100',
  };
}
