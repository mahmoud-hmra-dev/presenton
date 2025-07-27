"use client";
import Header from "@/app/dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import React from "react";

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-[#E9E8F8] font-inter">
      <Header />
      <Wrapper className="py-8 space-y-6">
        <h1 className="text-3xl font-bold mb-4">التوثيق</h1>
        <p className="mb-4">
          توضح هذه الصفحة التعديلات التي تمت على الموقع وكيفية استخدامه.
        </p>
        <h2 className="text-2xl font-semibold mb-2">التعديلات الأخيرة</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>استبدال شعار الموقع بعبارة <strong>Karen Ai</strong>.</li>
          <li>إضافة صفحة التوثيق وإظهارها في شريط التنقل.</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-2">طريقة الاستخدام</h2>
        <p>
          يمكنك إنشاء العروض التقديمية عبر لوحة التحكم باختيار مزود الذكاء
          الاصطناعي وإدخال مفتاح API، ثم تحديد الموضوع وعدد الشرائح واختيار
          الثيم. بعد ذلك يمكنك تعديل الشرائح وتصديرها بصيغة PDF أو PPTX.
        </p>
      </Wrapper>
    </div>
  );
};

export default DocumentationPage;
