# SANYU Hospital Community Marketing System — Rebuilt

This project restores the saved SANYU Hospital Boda Boda/community marketer application and adds medical-facility registration.

## Included modules
- Marketer email/password sign-in and account creation
- Marketer profile and password reset email
- Boda Boda stage registration and active stage listing
- Community registration for riders and pregnant women
- Rider phone OTP flow using Firebase Phone Authentication/reCAPTCHA
- My registrations, client details, dashboard and commission summary
- Medical facility registration and personal facility directory

## Medical facility database record
Saved under `bodaProgram/facilities/{facilityId}` with:
`facilityId`, `facilityName`, `contact`, `location`, `ownerName`, `marketerId`, `marketerName`, `registeredAt`, `status`.

Duplicate checks compare the contact number, or the facility name + location, against existing facility records before saving. This is a client-side duplicate check; for strict concurrent duplicate prevention, move the check to a trusted Cloud Function/transaction and enforce suitable database rules.

## Firebase configuration
The recovered JavaScript contains the Firebase project configuration from the saved source. Firebase web config is not a server secret, but access must be protected with Firebase Authentication and Realtime Database Security Rules.

The existing Firebase project is `abbah-83a7b`. Do not delete or overwrite its database. Before deployment, confirm in Firebase Console that Email/Password sign-in and Phone sign-in are enabled, that SMS billing/quota is configured, and that the deployed domain is listed in Authentication authorized domains.

## Important deployment notes
1. Test locally over a local web server (not by opening HTML as `file://`).
2. Check the Firebase Realtime Database rules before making the app live. The front end expects authenticated marketers to read the facility directory for duplicate detection and to write their own facility records. Restrict records by `marketerId` wherever practical.
3. The recovered source has known legacy Firebase v9.0.2 imports. Test phone OTP carefully because Firebase Phone Auth billing, quota, and reCAPTCHA configuration are controlled in the Firebase Console.
4. This ZIP is a rebuilt source package. It has not been deployed to Codeberg/GitHub and no live Firebase writes have been performed.

## Run locally
Serve this directory with a static web server, for example `python -m http.server 8000`, then open `http://localhost:8000`.
