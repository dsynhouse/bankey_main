
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, SUPPORT_EMAIL } from './LegalData';

const DataProtection: React.FC = () => {
    return (
        <LegalLayout title="Data Protection Policy">
            <p>
                At <strong>{LEGAL_ENTITY}</strong>, we take the sanctity of your financial data seriously. This Data Protection Policy outlines the specific technical and organizational measures we implement to ensure the security, integrity, and confidentiality of your data.
            </p>

            <h3>1. Data Encryption</h3>
            <p>
                We employ industry-standard encryption protocols to protect your data both in transit and at rest.
            </p>
            <ul>
                <li><strong>In Transit:</strong> All data transmitted between your device and our servers is encrypted using <strong>TLS 1.2/1.3 (Transport Layer Security)</strong>.</li>
                <li><strong>At Rest:</strong> Sensitive data stored in our databases is encrypted using <strong>AES-256</strong> level encryption standards via our backend provider (Supabase).</li>
            </ul>

            <h3>2. Access Control</h3>
            <p>
                We practice the principle of least privilege. Internal access to user data is strictly limited to authorized personnel who require it for troubleshooting or maintenance purposes.
                We implement <strong>Row Level Security (RLS)</strong> on our databases to ensure that your data is only accessible by your authenticated account.
            </p>

            <h3>3. Data Minimization</h3>
            <p>
                We strictly collect only the data that is necessary for the functionality of the Platform.
                <ul>
                    <li>We do <strong>NOT</strong> store your complete credit card numbers or CVV codes. All payment processing is handled by Razorpay's secure PCI-DSS compliant infrastructure.</li>
                    <li>We do <strong>NOT</strong> sell your data to third-party advertisers.</li>
                </ul>
            </p>

            <h3>4. Breach Notification</h3>
            <p>
                In the unlikely event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify you and the relevant supervisory authority within 72 hours of becoming aware of the breach, in accordance with applicable laws.
            </p>

            <h3>5. International Data Transfers</h3>
            <p>
                Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                By using the Platform, you consent to such transfer. We take all steps reasonably necessary to ensure that your data is treated securely.
            </p>

            <h3>6. Contact Officer</h3>
            <p>
                For any data protection related inquiries or to exercise your data rights, please contact our Data Protection Officer at: <br />
                <strong>Email:</strong> {SUPPORT_EMAIL}
            </p>
        </LegalLayout>
    );
};

export default DataProtection;
