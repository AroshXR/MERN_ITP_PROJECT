import React, { useEffect } from "react";
import "./TermsAndConditions.css";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0); // auto-scroll to top
    }, []);

    return (
        <div className="tc-container">
            <div className="tc-content">
                <div className="tc-footer">
                    <button
                        className="tc-back-button"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>
                </div>

                <header className="tc-header">
                    <h1>Terms and Conditions for Klassy T Shirts</h1>
                    <p>Last updated: September 23, 2025</p>
                </header>

                <main className="tc-main">
                    <section className="tc-section">
                        <p>
                            Welcome to Klassy T Shirts. By accessing or using our website,
                            you agree to comply with these Terms and Conditions. If you do
                            not agree, please do not use our Service.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Definitions</h2>
                        <ul>
                            <li><strong>Company</strong> refers to Klassy T Shirts.</li>
                            <li><strong>Service</strong> refers to our website and related services.</li>
                            <li><strong>You</strong> means the individual using the Service.</li>
                            <li>
                                <strong>Website</strong> refers to Klassy T Shirts, accessible
                                from <a href="http://www.klassytshirts.com">www.klassytshirts.com</a>.
                            </li>
                        </ul>
                    </section>

                    <section className="tc-section">
                        <h2>Use of the Service</h2>
                        <p>You agree to use the Service only for lawful purposes. You may not:</p>
                        <ul>
                            <li>Engage in any unlawful or fraudulent activity.</li>
                            <li>Attempt to gain unauthorized access to the Service.</li>
                            <li>Disrupt the Service or servers in any way.</li>
                        </ul>
                    </section>

                    <section className="tc-section">
                        <h2>Intellectual Property</h2>
                        <p>
                            All content, trademarks, and logos on this website are owned or
                            licensed by Klassy T Shirts. You may not use our intellectual
                            property without prior permission.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Purchases and Payments</h2>
                        <p>
                            When you make a purchase through our Service, you agree to
                            provide accurate payment information. All sales are final unless
                            otherwise specified.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Klassy T Shirts will not
                            be liable for any damages arising from your use of the Service.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Governing Law</h2>
                        <p>
                            These Terms shall be governed and interpreted in accordance with
                            the laws of Sri Lanka, without regard to its conflict of law rules.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. You are advised to
                            review this page periodically for any changes.
                        </p>
                    </section>

                    <section className="tc-section">
                        <h2>Contact Us</h2>
                        <p>If you have any questions about these Terms, you can contact us:</p>
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

export default TermsAndConditions;
