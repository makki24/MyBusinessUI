/**
 * CustomDrawerContent Logout Tests
 *
 * Bug #7: Drawer logout does not clear @user cache from AsyncStorage.
 * After logout via drawer, if the app is opened offline, the stale @user
 * data can be loaded and the user appears logged in with old data.
 *
 * This test directly checks the source code logic of handleLogout to ensure
 * both @token and @user are cleared on drawer logout.
 *
 * This test will FAIL before the fix and PASS after.
 */
import fs from "fs";
import path from "path";

describe("CustomDrawerContent Logout - Bug #7", () => {
  it("should clear both @token AND @user from AsyncStorage on drawer logout", () => {
    const sourceCode = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../src/components/common/CustomDrawerContent.tsx",
      ),
      "utf-8",
    );

    // Find the handleLogout function
    const handleLogoutMatch = sourceCode.match(/const handleLogout[\s\S]*?};/);
    expect(handleLogoutMatch).not.toBeNull();

    const handleLogoutCode = handleLogoutMatch![0];

    // Verify that handleLogout removes BOTH @token AND @user
    expect(handleLogoutCode).toContain('removeItem("@token")');
    expect(handleLogoutCode).toContain('removeItem("@user")');
  });
});
