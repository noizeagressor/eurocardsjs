# Roadmap: EuroCards Premium TMA (Update 2.0)

## 1. Referral System 2.0 (Backend & Bot)
- [ ] **Bot:** Update `backend/bot/main.py`:
    - Handle `/start <referrer_id>` to register referral link seamlessly.
    - On `/start` (without args or with), send welcome message with Inline Buttons: "Launch App" (WebApp) and "Support" (URL).
- [ ] **Backend:** Update `GET /api/v1/users/me/referrals` logic:
    - `Invited`: Total referrals.
    - `Confirmed`: Referrals who have at least one order with status `paid`.

## 2. New Order UI (Frontend)
- [ ] **Frontend:** Install `react-hook-form`, `zod`, `@hookform/resolvers`.
- [ ] **Backend:** Create endpoint `POST /api/v1/promocodes/validate` for real-time check.
- [ ] **Frontend:** Implement `OrderForm` component in `page.tsx` (or separate file):
    - **Trigger:** "Order" button in Bottom Sheet.
    - **Fields:**
        - Name/Surname: Latin characters only validation. Red border + Haptic warning on error.
        - Date of Birth: Date picker blocking < 18 years old.
        - Promo Code: Input with API validation.
            - Valid: Green border + Haptic success + Price update (strikethrough old, show new in #D7FF00).
            - Invalid: Red border + Haptic warning.

## 3. Personal Cabinet & Data
- [ ] **Backend:** Create endpoint `GET /api/v1/orders/my` to fetch current user's orders.
- [ ] **Frontend:** Update "Orders" tab to fetch and display real orders from API.
- [ ] **Frontend:** Integrate `WebApp.HapticFeedback` for:
    - Validation errors (notificationOccurred 'error' or impactOccurred 'heavy').
    - Success actions (notificationOccurred 'success').
    - Selection changes (impactOccurred 'light').

## 4. Tech Stack & Cleanup
- [ ] **Backend:** Ensure `User`, `Order`, `PromoCode` models support new requirements.
- [ ] **Frontend:** Use Tailwind CSS for styling, Lucide React for icons.
