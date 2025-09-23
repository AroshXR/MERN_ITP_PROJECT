import React, { useEffect } from "react";
import "./PrivacyPolicy.css";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    useEffect(() => {
        window.scrollTo(0, 0); // auto-scroll to top
    }, []);

    return (
        <div className="policy-container">
            <div className="policy-content">
                <div className="policy-footer">
                    <button
                        className="policy-back-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                </div>
                <header className="policy-header">
                    <h1>Privacy Policy for Klassy T Shirts</h1>
                    <p>Last updated: September 23, 2025</p>
                </header>

                <main className="policy-main">
                    <section className="policy-section">
                        <p>
                            This Privacy Policy describes Our policies and procedures on the
                            collection, use and disclosure of Your information when You use
                            the Service and tells You about Your privacy rights and how the
                            law protects You.
                        </p>
                        <p>
                            We use Your Personal data to provide and improve the Service. By
                            using the Service, You agree to the collection and use of
                            information in accordance with this Privacy Policy.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Interpretation and Definitions</h2>
                        <h3>Interpretation</h3>
                        <p>
                            The words of which the initial letter is capitalized have meanings
                            defined under the following conditions. The following definitions
                            shall have the same meaning regardless of whether they appear in
                            singular or in plural.
                        </p>

                        <h3>Definitions</h3>
                        <ul>
                            <li>
                                <strong>Account</strong> means a unique account created for You
                                to access our Service or parts of our Service.
                            </li>
                            <li>
                                <strong>Affiliate</strong> means an entity that controls, is
                                controlled by or is under common control with a party.
                            </li>
                            <li>
                                <strong>Company</strong> (referred to as either "the Company",
                                "We", "Us" or "Our" in this Agreement) refers to Klassy T
                                Shirts.
                            </li>
                            <li>
                                <strong>Cookies</strong> are small files placed on Your device
                                containing browsing history.
                            </li>
                            <li>
                                <strong>Country</strong> refers to: Sri Lanka.
                            </li>
                            <li>
                                <strong>Device</strong> means any device that can access the
                                Service.
                            </li>
                            <li>
                                <strong>Personal Data</strong> is any information that relates
                                to an identified or identifiable individual.
                            </li>
                            <li>
                                <strong>Service</strong> refers to the Website.
                            </li>
                            <li>
                                <strong>Service Provider</strong> means any natural or legal
                                person who processes the data on behalf of the Company.
                            </li>
                            <li>
                                <strong>Usage Data</strong> refers to data collected
                                automatically.
                            </li>
                            <li>
                                <strong>Website</strong> refers to Klassy T Shirts, accessible
                                from <a href="http://www.klassytshirts.com">www.klassytshirts.com</a>
                            </li>
                            <li>
                                <strong>You</strong> means the individual accessing or using the
                                Service, or the company, or other legal entity on behalf of
                                which such individual is accessing or using the Service.
                            </li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>Collecting and Using Your Personal Data</h2>
                        <h3>Personal Data</h3>
                        <p>
                            While using Our Service, We may ask You to provide Us with certain
                            personally identifiable information, including but not limited to:
                        </p>
                        <ul>
                            <li>Email address</li>
                            <li>Address, State, Province, ZIP/Postal code, City</li>
                            <li>Usage Data</li>
                        </ul>

                        <h3>Usage Data</h3>
                        <p>
                            Usage Data is collected automatically when using the Service. This
                            may include information such as IP address, browser type, pages
                            visited, and other diagnostic data.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Tracking Technologies and Cookies</h2>
                        <p>
                            We use Cookies and similar tracking technologies to track activity
                            on Our Service. You can instruct Your browser to refuse all
                            Cookies or to indicate when a Cookie is being sent.
                        </p>
                        <ul>
                            <li>
                                <strong>Necessary / Essential Cookies</strong> (Session) –
                                essential for authentication and fraud prevention.
                            </li>
                            <li>
                                <strong>Cookies Policy / Notice Acceptance Cookies</strong>{" "}
                                (Persistent) – identifies if users accepted cookie use.
                            </li>
                            <li>
                                <strong>Functionality Cookies</strong> (Persistent) – remembers
                                preferences such as login details or language.
                            </li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>Use of Your Personal Data</h2>
                        <ul>
                            <li>To provide and maintain our Service</li>
                            <li>To manage Your Account</li>
                            <li>For performance of a contract</li>
                            <li>To contact You</li>
                            <li>To provide You with news and offers</li>
                            <li>To manage Your requests</li>
                            <li>For business transfers</li>
                            <li>For data analysis and service improvement</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>Retention, Transfer & Deletion of Your Data</h2>
                        <p>
                            We will retain Your Personal Data only as long as necessary. Data
                            may be transferred across jurisdictions. You have the right to
                            request deletion of your data unless legal obligations require
                            retention.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Disclosure of Your Data</h2>
                        <ul>
                            <li>For business transactions</li>
                            <li>To comply with law enforcement requests</li>
                            <li>
                                To protect rights, safety, prevent wrongdoing, or defend against
                                liability
                            </li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>Children's Privacy</h2>
                        <p>
                            Our Service does not address anyone under 13. If we become aware
                            of data collected from a child without parental consent, we will
                            delete it.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Links to Other Websites</h2>
                        <p>
                            Our Service may contain links to other websites not operated by
                            Us. We are not responsible for third-party practices.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Changes to this Privacy Policy</h2>
                        <p>
                            We may update Our Privacy Policy from time to time. You are
                            advised to review this page periodically for any changes.
                        </p>
                    </section>

                    <section className="policy-section">
                        <h2>Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, You can
                            contact us:
                        </p>
                        <ul>
                            <li>
                                By email:{" "}
                                <a href="mailto:support@klassytshirts.com">
                                    support@klassytshirts.com
                                </a>
                            </li>
                        </ul>
                    </section>
                </main>

                

            </div>
        </div>
    );
};

export default PrivacyPolicy;
