
import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, SUPPORT_EMAIL, APP_NAME } from './LegalData';
import { Zap, Globe, Clock, AlertCircle } from 'lucide-react';

const ShippingPolicy: React.FC = () => {
    return (
        <LegalLayout title="Shipping & Delivery Policy">
            <div className="bg-banky-blue/10 border-2 border-banky-blue p-6 rounded-xl mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-banky-blue" />
                    <h4 className="font-black uppercase text-lg m-0 text-ink">Digital Product Notice</h4>
                </div>
                <p className="text-gray-700 m-0">
                    <strong>{APP_NAME}</strong> is a <strong>100% digital product</strong>. We do not ship any physical goods.
                    All services are delivered electronically through our web application.
                </p>
            </div>

            <h3>1. Nature of Service</h3>
            <p>
                <strong>{APP_NAME}</strong>, operated by <strong>{LEGAL_ENTITY}</strong>, is a digital financial management
                and education platform. Our services include:
            </p>
            <ul>
                <li>Expense tracking and budgeting tools</li>
                <li>Financial education modules and interactive lessons</li>
                <li>AI-powered financial advisor</li>
                <li>Premium features (for Premium subscribers)</li>
            </ul>
            <p>
                All the above services are delivered <strong>digitally</strong> via our web application and do not
                involve any physical shipping or delivery.
            </p>

            <h3>2. Delivery of Digital Services</h3>
            <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-white border-2 border-ink p-4 rounded-xl shadow-neo-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-banky-green" />
                        <span className="font-bold text-ink">Instant Access</span>
                    </div>
                    <p className="text-gray-600 text-sm m-0">
                        Upon successful registration or subscription, you gain immediate access to our platform and its features.
                    </p>
                </div>
                <div className="bg-white border-2 border-ink p-4 rounded-xl shadow-neo-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-banky-purple" />
                        <span className="font-bold text-ink">24/7 Availability</span>
                    </div>
                    <p className="text-gray-600 text-sm m-0">
                        Our services are available around the clock, subject to scheduled maintenance and unforeseen downtime.
                    </p>
                </div>
            </div>

            <h3>3. Free Tier Access</h3>
            <p>
                Upon signing up for {APP_NAME}, you receive <strong>immediate access</strong> to all Free tier features, including:
            </p>
            <ul>
                <li>Basic expense tracking</li>
                <li>Budget management tools</li>
                <li>Access to educational content</li>
                <li>Basic reports and analytics</li>
            </ul>

            <h3>4. Premium Subscription Delivery</h3>
            <p>
                When you subscribe to <strong>{APP_NAME} Premium</strong>:
            </p>
            <ul>
                <li><strong>Activation:</strong> Premium features are activated <strong>instantly</strong> upon successful payment confirmation from our payment gateway (Razorpay).</li>
                <li><strong>Feature Access:</strong> You will have immediate access to all premium features, including AI Advisor, advanced analytics, and OCR receipt scanning.</li>
                <li><strong>Confirmation:</strong> You will receive an email confirmation at your registered email address.</li>
            </ul>

            <h3>5. Service Availability</h3>
            <p>
                While we strive for 99.9% uptime, there may be occasional service interruptions due to:
            </p>
            <ul>
                <li>Scheduled maintenance (users will be notified in advance when possible)</li>
                <li>Emergency maintenance for security or critical updates</li>
                <li>Third-party service provider downtime</li>
                <li>Circumstances beyond our reasonable control</li>
            </ul>

            <h3>6. No Physical Shipping</h3>
            <div className="flex items-start gap-4 bg-gray-100 p-4 rounded-xl border border-gray-200">
                <AlertCircle className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
                <p className="text-gray-600 m-0">
                    <strong>{APP_NAME} does not involve any physical products, shipping, or delivery logistics.</strong>
                    We do not collect shipping addresses, and no physical goods will be dispatched. All services are
                    accessed through our website at the point of purchase/subscription.
                </p>
            </div>

            <h3>7. Questions?</h3>
            <p>
                If you have any questions about accessing our digital services or experience any issues with service delivery,
                please contact us at:
            </p>
            <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-banky-blue hover:underline">
                    {SUPPORT_EMAIL}
                </a>
            </p>
        </LegalLayout>
    );
};

export default ShippingPolicy;
