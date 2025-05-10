
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container py-12 pt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Last updated: May 10, 2025</p>
            
            <h2>Introduction</h2>
            <p>
              Welcome to Resonance. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we handle your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
            
            <h2>The Data We Collect</h2>
            <p>
              We collect several types of information from and about users of our platform, including:
            </p>
            <ul>
              <li><strong>Personal identification information:</strong> Name, email address, username, profile photo.</li>
              <li><strong>Profile information:</strong> Bio, user type (musician or listener), music preferences.</li>
              <li><strong>User-generated content:</strong> Posts, comments, likes, and other interactions.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information, time zone, and cookies.</li>
              <li><strong>Usage data:</strong> Information about how you use our platform.</li>
            </ul>
            
            <h2>How We Use Your Data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features on our platform</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To personalize your experience and deliver content relevant to your interests</li>
            </ul>
            
            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect against unauthorized access, alteration,
              disclosure, or destruction of your personal data. However, please note that no method of transmission
              over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>Data Sharing and Third Parties</h2>
            <p>We may share your personal information with:</p>
            <ul>
              <li><strong>Service providers:</strong> We may employ third-party companies to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used.</li>
              <li><strong>Business partners:</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
              <li><strong>Other users:</strong> When you share personal information or interact publicly on our platform.</li>
              <li><strong>Legal requirements:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
            </ul>
            
            <h2>Your Data Protection Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:</p>
            <ul>
              <li>The right to access your personal data</li>
              <li>The right to correction of your personal data</li>
              <li>The right to erasure of your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal data</li>
            </ul>
            
            <h2>Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our platform and hold certain information.
              Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However,
              if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
            
            <h2>Children's Privacy</h2>
            <p>
              Our service is not intended for use by children under the age of 13. We do not knowingly collect
              personally identifiable information from children under 13. If we discover that a child under 13
              has provided us with personal information, we will delete it immediately.
            </p>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              privacy@resonance.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
