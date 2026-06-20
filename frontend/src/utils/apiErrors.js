export function getApiErrorMessage(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(', ');
  }
  return err.message || 'Something went wrong';
}
