
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY } from './LegalData';

const Disclaimers: React.FC = () => {
    return (
        <LegalLayout title="Disclaimers">
            <p>
                Please read this Disclaimer carefully before using the <strong>{LEGAL_ENTITY}</strong> Platform.
            </p>

            <h3>1. No Financial Advice</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                <p className="text-sm text-yellow-800 font-bold m-0">
                    IMPORTANT: The information provided on this Platform is for educational and informational purposes only and does NOT constitute professional financial advice.
                </p>
            </div>
            <p>
                <strong>{LEGAL_ENTITY}</strong> is not a registered investment advisor, broker-dealer, or financial analyst.
                Users should not make financial decisions based solely on the information provided by the Platform.
                We strongly recommend consulting with a qualified financial advisor before making any investment decisions.
            </p>

            <h3>2. Use of Artificial Intelligence</h3>
            <p>
                Our "Financial Hype Man" / "Advisor" features utilize advanced Artificial Intelligence (AI) to generate insights.
                While we strive for accuracy, AI models can occasionally produce incorrect, biased, or outdated information ("hallucinations").
                <ul>
                    <li>We do not guarantee the accuracy, completeness, or reliability of any AI-generated advice.</li>
                    <li>You are solely responsible for verifying any information provided by the AI before acting on it.</li>
                </ul>
            </p>

            <h3>3. Investment Risks</h3>
            <p>
                All investments carry risk, including the loss of principal. Past performance of any security or strategy is not a guarantee of future results.
                <strong>{LEGAL_ENTITY}</strong> assumes no responsibility for any losses incurred as a result of your financial activities using our trackers or educational content.
            </p>

            <h3>4. Third-Party Links</h3>
            <p>
                The Platform may contain links to third-party web sites or services that are not owned or controlled by us.
                We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
            </p>

            <h3>5. "As Is" Basis</h3>
            <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
        </LegalLayout>
    );
};

export default Disclaimers;
