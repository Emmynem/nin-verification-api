export const user_email_verification = (data) => {
	const email_subject = `Email verification`;
	const email_text = `Open the link below on a new tab to verify your email <br/><br/> Verification Link: <a href="${data.verification_link}" target="_blank">${data.verification_link}</a>`;
	const email_html = `Open the link below on a new tab to verify your email <br/><br/> Verification Link: <a href="${data.verification_link}" target="_blank">${data.verification_link}</a>`;

	return { email_html, email_subject, email_text };
};