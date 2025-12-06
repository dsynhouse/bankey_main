
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, GOVERNING_LAW_JURISDICTION, SUPPORT_EMAIL } from './LegalData';

const TermsOfService: React.FC = () => {
    return (
        <LegalLayout title="Terms of Service">
            <p>
                Welcome to <strong>{LEGAL_ENTITY}</strong>. By accessing or using our mobile application and website (the "Platform"), you agree to be bound by these Terms of Service ("Terms").
                If you differ or disagree with any part of the terms, then you may not access the Platform.
            </p>

            <h3>1. Acceptance of Terms</h3>
            <p>
                These Terms constitute a legally binding agreement between you and <strong>{LEGAL_ENTITY}</strong> regarding your use of the Platform.
                These Terms are an electronic record in terms of the <strong>Information Technology Act, 2000</strong> and rules made thereunder.
            </p>

            <h3>2. User Accounts</h3>
            <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                You are responsible for safeguarding the password/OTP that you use to access the service and for any activities or actions under your account.
            </p>

            <h3>3. Intellectual Property</h3>
            <p>
                The Platform and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of <strong>{LEGAL_ENTITY}</strong> and its licensors.
                The Platform is protected by copyright, trademark, and other laws of both India and foreign countries.
            </p>

            <h3>4. Subscription and Payments</h3>
            <p>
                Certain parts of the Service (e.g., Premium Advisor, OCR) are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle").
                Payments are processed via our third-party partner, <strong>Razorpay</strong>. By making a payment, you agree to Razorpay's terms and conditions in addition to ours.
            </p>

            <h3>5. Limitation of Liability</h3>
            <p>
                In no event shall <strong>{LEGAL_ENTITY}</strong>, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul>
                <li>Your access to or use of or inability to access or use the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any content obtained from the Service; and</li>
                <li>Unauthorized access, use or alteration of your transmissions or content.</li>
            </ul>

            <h3>6. Governing Law</h3>
            <p>
                These Terms shall be governed and construed in accordance with the laws of <strong>{GOVERNING_LAW_JURISDICTION}</strong>, without regard to its conflict of law provisions.
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3>7. Changes to Terms</h3>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>

            <h3>8. Contact Us</h3>
            <p>
                If you have any questions about these Terms, please contact us at <strong>{SUPPORT_EMAIL}</strong>.
            </p>
        </LegalLayout>
    );
};

export default TermsOfService;
