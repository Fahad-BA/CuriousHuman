export function formatTimeAgo(dateString) {
  
  // 1. تنظيف السلسلة: استبدال المسافات بحرف 'T' للفصل بين التاريخ والوقت.
  //    يضمن هذا التنسيق أن يتمكن كائن Date من قراءة التاريخ والوقت بشكل صحيح.
  let dateToParse = dateString.replace(' ', 'T');
  
  // 2. إصلاح مشكلة التوقيت: لا نجبر UTC لأن PostgreSQL يخزن بالتوقيت المحلي
  //    نحتفظ بالتوقيت كما هو بدون إضافة 'Z' لتجنب مشكلة الـ 3 ساعات
  //    إذا كان التوقيت يحتوي على منطقة زمنية، نستخدمها كما هي
  if (!dateToParse.includes('+') && !dateToParse.includes('-')) {
      // لا تضف 'Z' - دع JavaScript يتعامل معه كتوقيت محلي
  }

  const date = new Date(dateToParse);
  const now = new Date();
  const diffMs = now - date;
  
  // 3. حساب الفارق
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  // 4. عرض النتيجة
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `قبل ${diffMin} دقيقة`;
  if (diffHr < 24) return `قبل ${diffHr} ساعة`;
  if (diffDays <= 6) return `قبل ${diffDays} يوم`;

  // بعد 6 أيام نرجع التاريخ فقط بدون الوقت (بتنسيق عربي)
  return date.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}