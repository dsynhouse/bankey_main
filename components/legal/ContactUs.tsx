import React from 'react';
import LegalLayout from './LegalLayout';
import { LEGAL_ENTITY, SUPPORT_EMAIL, WEBSITE_URL, OFFICE_ADDRESS, APP_NAME } from './LegalData';
import { Mail, MapPin, Globe, Clock, MessageCircle } from 'lucide-react';

const ContactUs: React.FC = () => {
    return (
        <LegalLayout title="Contact Us">
            <p>
                We're here to help! If you have any questions, concerns, or feedback about <strong>{APP_NAME}</strong>,
                please don't hesitate to reach out to us. Our team is committed to providing you with the best possible support.
            </p>

            <div className="bg-white border-2 border-ink p-6 rounded-xl shadow-neo-sm my-8">
                <h3 className="flex items-center gap-3 text-xl mb-6">
                    <Mail className="w-6 h-6 text-banky-blue" />
                    Get In Touch
                </h3>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-banky-yellow p-2 rounded-lg border border-ink">
                            <Mail className="w-5 h-5 text-ink" />
                        </div>
                        <div>
                            <p className="font-bold text-ink uppercase text-sm tracking-wider">Email</p>
                            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-banky-blue hover:underline font-medium">
                                {SUPPORT_EMAIL}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-banky-green p-2 rounded-lg border border-ink">
                            <Globe className="w-5 h-5 text-ink" />
                        </div>
                        <div>
                            <p className="font-bold text-ink uppercase text-sm tracking-wider">Website</p>
                            <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="text-banky-blue hover:underline font-medium">
                                {WEBSITE_URL}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-banky-pink p-2 rounded-lg border border-ink">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-ink uppercase text-sm tracking-wider">Registered Office</p>
                            <p className="text-gray-600">
                                <strong>{LEGAL_ENTITY}</strong><br />
                                {OFFICE_ADDRESS}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h3>Business Hours</h3>
            <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-banky-purple" />
                <p className="text-gray-600">
                    <strong>Monday to Friday:</strong> 10:00 AM - 6:00 PM IST<br />
                    <strong>Saturday & Sunday:</strong> Closed
                </p>
            </div>
            <p>
                We typically respond to all inquiries within <strong>24-48 business hours</strong>.
                For urgent matters, please mention "URGENT" in your email subject line.
            </p>

            <h3>Support Categories</h3>
            <ul>
                <li><strong>General Inquiries:</strong> Questions about {APP_NAME} features, pricing, or how to get started.</li>
                <li><strong>Technical Support:</strong> Issues with app functionality, bugs, or account access.</li>
                <li><strong>Billing & Payments:</strong> Questions about subscriptions, invoices, refunds, or payment methods.</li>
                <li><strong>Feedback & Suggestions:</strong> We love hearing your ideas to make {APP_NAME} better!</li>
                <li><strong>Partnership Inquiries:</strong> Business collaboration or integration opportunities.</li>
            </ul>

            <h3>Before Contacting Us</h3>
            <p>
                To help us serve you faster, please include the following information in your email:
            </p>
            <ul>
                <li>Your registered email address (if you have an account)</li>
                <li>A clear description of your question or issue</li>
                <li>Screenshots or error messages (if applicable)</li>
                <li>Your device type and browser (for technical issues)</li>
            </ul>

            <div className="bg-banky-yellow/20 border-2 border-banky-yellow p-6 rounded-xl mt-8">
                <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="w-6 h-6 text-ink" />
                    <h4 className="font-black uppercase text-lg m-0">Need Immediate Help?</h4>
                </div>
                <p className="text-gray-700 m-0">
                    For common questions about subscriptions, cancellations, and refunds, please check our{' '}
                    <a href="#/cancellation" className="text-banky-blue font-bold hover:underline">Cancellation & Refund Policy</a>.
                    For privacy-related concerns, refer to our{' '}
                    <a href="#/privacy" className="text-banky-blue font-bold hover:underline">Privacy Policy</a>.
                </p>
            </div>
        </LegalLayout>
    );
};

export default ContactUs;
