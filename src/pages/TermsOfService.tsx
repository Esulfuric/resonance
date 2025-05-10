
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12 pt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Last updated: May 10, 2025</p>
            
            <h2>Introduction</h2>
            <p>
              Welcome to Resonance. By using our platform, you agree to be bound by these Terms of Service.
              Please read them carefully. If you do not agree to all of the terms, please do not use our services.
            </p>
            
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with
              any part of the terms, you may not access the Service.
            </p>
            
            <h2>User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information.
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password used to access the Service and for any activities
              or actions under your password. You agree not to disclose your password to any third party.
              We cannot and will not be liable for any loss or damage arising from your failure to comply with this section.
            </p>
            
            <h2>User Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information,
              text, graphics, videos, or other material. You are responsible for the content that you post,
              including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting content, you grant us the right to use, modify, publicly perform, publicly display,
              reproduce, and distribute such content on and through our Service. You retain any and all of your rights
              to any content you submit, post or display on or through the Service and are responsible for protecting those rights.
            </p>
            
            <h2>Prohibited Uses</h2>
            <p>You agree not to use the Service:</p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter" or "spam".</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm the Company or users of the Service.</li>
            </ul>
            
            <h2>Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by users), features and functionality are and will remain
              the exclusive property of Resonance and its licensors. The Service is protected by copyright, trademark,
              and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used
              in connection with any product or service without our prior written consent.
            </p>
            
            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
              including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
            
            <h2>Limitation of Liability</h2>
            <p>
              In no event shall Resonance, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation,
              loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability
              to access or use the Service.
            </p>
            
            <h2>Changes to Terms of Service</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing
              to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
            
            <h2>Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of the United States,
              without regard to its conflict of law provisions.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              terms@resonance.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
