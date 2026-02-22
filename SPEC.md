# 今晚食唔食 - MVP Demo Specification

## Project Overview
- **Project Name:** 今晚食唔食 (Tonight Eat or Not)
- **Type:** Web App with Mobile Preview
- **Core Functionality:** Hong Kong family daily dinner confirmation system
- **Target Users:** Hong Kong families, parents, children

## UI/UX Specification

### Layout Structure
- **Web Preview Page:** Full-screen iPhone mockup containing the app
- **App Screens:**
  1. Splash Screen
  2. OTP Login Screen
  3. Create Family Screen
  4. Invite Members Screen
  5. Home Screen (Daily Status)
  6. History Screen
  7. Settings Screen

### Visual Design

#### Color Palette
- **Primary:** #D72638 (Arc Crimson - for CTA buttons)
- **Background:** #0A0A0A (Obsidian Black)
- **Surface:** #1A1A1A (Card backgrounds)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #888888
- **Success:** #22C55E (Green - for "會")
- **Danger:** #EF4444 (Red - for "唔會")
- **Warning:** #F59E0B (Amber - for "未知")

#### Typography
- **Font Family:** "Noto Sans HK", sans-serif
- **Heading:** 24px-32px, Bold
- **Body:** 16px-18px, Regular
- **Button Text:** 20px, Bold

#### Spacing
- **Base unit:** 8px
- **Screen padding:** 24px
- **Button height:** 56px (large touch targets)
- **Card padding:** 16px

### Components

#### 1. iPhone Mockup Frame
- Fixed dimensions: 390x844px (iPhone 14/15)
- Rounded corners: 40px
- Border: 4px solid #333
- Shadow: 0 25px 50px rgba(0,0,0,0.5)
- Centered on page with dark background

#### 2. App Screens

**Splash Screen:**
- Centered logo (rice bowl emoji 🍚)
- App name in large text
- Tagline: "香港家庭每日 1 秒回覆系統"
- "開始" button at bottom

**OTP Login:**
- Phone number input with +852 prefix
- "發送驗證碼" button
- 6-digit OTP input (after phone verified)
- "登入" button

**Create Family:**
- Family name input field
- Role selection (媽媽/爸爸/子女/其他)
- "建立家庭" button

**Invite Members:**
- Display generated invite link
- Copy link button
- "輸入電話號碼邀請" option
- "完成" button

**Home Screen (Core):**
- Date display: "今晚 2月21日（星期五）"
- Family members list with avatars and status
- Each member: emoji + name + status (⏰/✅/❌/⏳)
- Three large response buttons at bottom:
  - [ ✅ 會 ] - Green
  - [ ❌ 唔會 ] - Red  
  - [ ⏰ 未知 ] - Amber
- Counter: "今晚共 X 人食飯"

**History Screen:**
- List of past 7 days
- Each day shows: date, count of attendees
- Tap to expand and see details

**Settings Screen:**
- Push notification time picker
- Family members list with management options
- Account info

## Functionality Specification

### Core Features (MVP)
1. **User Authentication**
   - Phone OTP login (simulated for demo)
   - Session persistence

2. **Family Management**
   - Create family with name and role
   - Invite members via link or phone
   - View family members

3. **Daily Response**
   - View today's status for all family members
   - Submit own response (會/唔會/未知)
   - Real-time update of response count

4. **History**
   - View past 7 days responses
   - See daily attendee counts

5. **Settings**
   - Adjust push notification time (admin only)
   - Manage family members (admin only)

### Demo Data
Pre-populated with:
- Family: "陳家"
- Members: 媽媽, 爸爸, 阿仔
- Today's responses partially filled for demonstration

## Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** React useState/useContext
- **Mock Data:** Static JSON for demo

## Acceptance Criteria
1. ✅ iPhone mockup displays correctly on desktop
2. ✅ All 7 screens are navigable
3. ✅ Response buttons update the UI immediately
4. ✅ Member count updates when responses change
5. ✅ Smooth transitions between screens
6. ✅ Works on both desktop and mobile browsers
7. ✅ Bilingual support: Chinese UI throughout
