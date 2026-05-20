# Security Specification

## 1. Data Invariants
- **User Document**: Can only exist for allowed profile (`andre`). Must contain at least `id` as string and `name` as string. Optional fields like `isAutistic` or `hasADHD` must be booleans.
- **DailyLog Document**: Nested under `/users/{userId}/dailyLogs/{date}`. Must have optional fields `confirmedMeals` as map, `waterIntake` as number, `waterGoal` as number, and `healthMeasurements` as map.
- **Progress Document**: Nested under `/users/{userId}/progress/main`. Must contain optional fields `data` as list and `workouts` as list.
- **No Orphaned Documents**: Direct/arbitrary writes outside allowed users are forbidden. No document deletion is permitted for any path.

## 2. The "Dirty Dozen" Payloads (Attacks)
The following payloads representing violations of types, constraints, or IDs must be rejected:

1. **User Profile ID Poisoning**: Create `/users/attacker` (invalid profile ID).
2. **User Profile Schema Over-Injection**: Create `/users/andre` with random "ghost" fields e.g., `{ id: "andre", name: "André", hacker: true }`.
3. **User Profile Missing Required Fields**: Save `/users/andre` with only `{ name: "André" }` (missing `id`).
4. **User Profile Type Poisoning (isAutistic as string)**: Save `/users/andre` with `{ id: "andre", name: "André", isAutistic: "yes" }`.
5. **User Profile Type Poisoning (name as array)**: Save `/users/andre` with `{ id: "andre", name: ["André"] }`.
6. **DailyLog Type Poisoning (waterIntake as string)**: Save dailyLog with `{ waterIntake: "3000" }`.
7. **DailyLog Type Poisoning (confirmedMeals as string)**: Save dailyLog with `{ confirmedMeals: "all" }`.
8. **DailyLog Unauthorized Write**: Write dailyLog to `/users/attacker/dailyLogs/2026-05-20` (path injection).
9. **Progress Type Poisoning (data as string)**: Save progress with `{ data: "none" }`.
10. **Progress Type Poisoning (workouts as map)**: Save progress with `{ workouts: {} }` (should be list).
11. **Progress Document ID Poisoning**: Write progress to `/users/andre/progress/hacked` instead of standard `main` ID.
12. **Arbitrary Collection Write**: Create document in `/unauthorized_collection/test` containing anything.

## 3. Test Cases (TDD Verification)
Every test case in our test suite verifies that the security rules correctly block the above payloads and allow legitimate operations on `/users/andre` sub-paths.
