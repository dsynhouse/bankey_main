
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, SUPPORT_EMAIL, GOVERNING_LAW_JURISDICTION } from './LegalData';

const PrivacyPolicy: React.FC = () => {
    return (
        <LegalLayout title="Privacy Policy">
            <p>
                At <strong>{LEGAL_ENTITY}</strong> ("we," "our," or "us"), we are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (the "Platform").
            </p>
            <p>
                This policy is drafted in accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> of India, along with global privacy standards including GDPR where applicable.
            </p>

            <h3>1. Information We Collect</h3>
            <p>We collect information that helps us provide you with the best financial tracking experience.</p>
            <ul>
                <li><strong>Personal Identification Information:</strong> Name, email address, phone number (for authentication via OTP).</li>
                <li><strong>Financial Data:</strong> Transaction history, expense categories, budget limits, and savings goals that you manually input or sync.</li>
                <li><strong>Device Information:</strong> Device model, operating system, and unique device identifiers (for security and session management).</li>
                <li><strong>Usage Data:</strong> How you interact with our modules, lessons, and tools.</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>We use your information strictly for legitimate business purposes:</p>
            <ul>
                <li>To provide, operate, and maintain the Platform.</li>
                <li>To improve, personalize, and expand our Platform.</li>
                <li>To understand and analyze how you use our Platform.</li>
                <li>To process your transactions and manage your premium subscription.</li>
                <li>To send you updates, security alerts, and support messages.</li>
                <li>To comply with legal obligations.</li>
            </ul>

            <h3>3. Data Storage and Security</h3>
            <p>
                We implement <strong>bank-grade encryption (SSL/TLS)</strong> and standard security protocols to protect your data.
                Your personal information is stored on secure servers (Supabase) with strict access controls.
                While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h3>4. Sharing Your Information</h3>
            <p>We do NOT sell your personal data. We only share information in the following limited circumstances:</p>
            <ul>
                <li><strong>Service Providers:</strong> We may share data with third-party vendors (e.g., Razorpay for payments, Google Gemini for AI analysis) who perform services for us. These vendors are bound by confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency) in <strong>{GOVERNING_LAW_JURISDICTION}</strong>.</li>
            </ul>

            <h3>5. Your Rights</h3>
            <p>Depending on your location, you may have the following rights regarding your data:</p>
            <ul>
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data (Account Deletion is available in Settings).</li>
            </ul>

            <h3>6. Children's Privacy</h3>
            <p>
                Our Platform is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
            </p>

            <h3>7. Contact Us</h3>
            <p>
                If you have any questions about this Privacy Policy, please contact us at: <br />
                <strong>Email:</strong> {SUPPORT_EMAIL} <br />
                <strong>Entity:</strong> {LEGAL_ENTITY}
            </p>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
