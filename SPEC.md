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
  4. Join Family Screen (via invite link)
  5. Invite Members Screen
  6. Home Screen (Daily Status)
  7. History Screen
  8. Settings Screen

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

**Join Family (via Invite Link):**
- Display family name that user is joining
- Role selection (媽媽/爸爸/子女/其他)
- "加入家庭" button

**Invite Members:**
- Display generated unique invite link
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
- Empty state for new users: "暫時未有記錄"
- List of past days (only shows days with at least one response)
- Each day shows: date, count of attendees
- Tap to expand and see details
- Shows up to last 30 days

**Settings Screen:**
- Push notification time picker (admin only)
- Family members list with:
  - Member name and role
  - Admin badge for creator
  - Remove button (admin only, cannot remove self)
- Account info (your phone number)
- "離開家庭" button (for non-admin members)

## Functionality Specification

### Core Features (MVP)

#### 1. User Authentication
- Phone OTP login (simulated for demo)
- Session persistence via localStorage

#### 2. Family Management
- Create family with name and role
- Creator automatically becomes Admin
- Invite members via unique link
- Join family via invite link
- **Admin privileges:**
  - Remove members (cannot remove self)
  - Adjust notification time
  - Invite new members
- **Member privileges:**
  - Submit own response
  - View history
  - Leave family

#### 3. Daily Response
- View today's status for all family members
- Submit own response (會/晤會/未知)
- Real-time update of response count
- Cannot change other members' responses

#### 4. History
- Initially empty for new users
- Only shows days with at least one response
- Shows last 30 days
- Expandable details per day
- Member-by-member breakdown

#### 5. Settings
- **Admin only:**
  - Adjust push notification time
  - Remove family members
- **All members:**
  - View family members
  - View own account info
  - Leave family (non-admin only)

### Invite Link System
- Unique invite code generated for each family
- Link format: `{app-url}/join/{inviteCode}`
- Link is reusable (not single-use for MVP)
- When user joins via link:
  - User enters their name and role
  - User added to family members list
  - Redirected to Home screen

### Role System

| 角色 | 權限 |
|------|------|
| **Admin (創建者)** | 踢人、調較notification time、邀請成員、睇晒所有野 |
| **成員** | 自己回覆、睇history、離開家庭 |

### Demo Data
Pre-populated with:
- Family: "陳家"
- Members: 媽媽, 爸爸, 阿仔
- Today's responses partially filled for demonstration

**Note:** New users who create their own family will have empty history initially.

## Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** React useState/useContext
- **Storage:** localStorage for persistence
- **Mock Data:** Static JSON for demo

## Acceptance Criteria
1. ✅ iPhone mockup displays correctly on desktop
2. ✅ All 8 screens are navigable
3. ✅ Response buttons update the UI immediately
4. ✅ Member count updates when responses change
5. ✅ Smooth transitions between screens
6. ✅ Works on both desktop and mobile browsers
7. ✅ Bilingual support: Chinese UI throughout
8. ✅ New users have empty history initially
9. ✅ Invite link works to join family
10. ✅ Admin can remove members
11. ✅ Admin cannot remove themselves
12. ✅ Non-admin members can leave family
