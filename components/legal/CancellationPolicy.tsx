
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, SUPPORT_EMAIL } from './LegalData';

const CancellationPolicy: React.FC = () => {
    return (
        <LegalLayout title="Cancellation & Refund Policy">
            <p>
                At <strong>{LEGAL_ENTITY}</strong>, we believe in transparent and fair billing practices. This policy outlines your rights regarding subscription cancellations and refunds.
            </p>

            <h3>1. Cancellation Policy</h3>
            <p>
                You may cancel your Premium Subscription at any time through the "Settings" page in the application.
            </p>
            <ul>
                <li><strong>Effect of Cancellation:</strong> If you cancel your subscription, your premium access will continue until the end of your current billing period (month or year).</li>
                <li><strong>No Auto-Renewal:</strong> Once cancelled, your subscription will not auto-renew, and you will not be charged again.</li>
                <li><strong>Downgrade:</strong> After the billing period ends, your account will automatically revert to the Free tier. You will strictly retain all your data, but access to premium features (e.g., AI Advisor, OCR) will be locked.</li>
            </ul>

            <h3>2. Refund Policy</h3>
            <p>
                Since our Platform offers digital goods and immediate access to premium features (including AI computing costs), we generally adhere to a <strong>strict no-refund policy</strong> after the purchase is confirmed.
            </p>
            <p>
                However, exceptions may be made in the following cases at our sole discretion:
                <ul>
                    <li>If you were charged due to a technical error on our payments gateway.</li>
                    <li>If you were unable to access the premium features due to a confirmed platform-wide outage exceeding 48 hours.</li>
                </ul>
            </p>

            <h3>3. How to Request a Refund</h3>
            <p>
                If you believe you are eligible for a refund under the exceptions listed above, please contact our support team within <strong>7 days</strong> of the transaction.
                <br />
                <strong>Email:</strong> {SUPPORT_EMAIL}
                <br />
                Please include your Transaction ID and registered Email Address.
            </p>
        </LegalLayout>
    );
};

export default CancellationPolicy;
