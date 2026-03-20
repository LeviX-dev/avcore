export const checkTimeLogout = (req, res, next) => {

  if (!req.session || !req.session.user) {
    return next();
  }

  const now = new Date();
  const loginTime = new Date(req.session.user.loginTime);

  const hour = now.getHours();
  const minutes = now.getMinutes();

  // If user logged in before 7PM → logout at 7PM
  if (loginTime.getHours() < 19 && hour >= 19) {
    req.session.destroy(() => {});
    return res.status(401).json({
      message: "Session expired after 7 PM"
    });
  }

  // If user logged in after 7PM → logout at 11:55PM
  if (loginTime.getHours() >= 19 && hour === 23 && minutes >= 55) {
    req.session.destroy(() => {});
    return res.status(401).json({
      message: "Session expired for the day"
    });
  }

  next();
};
// 04:06

// export const checkTimeLogout = (req, res, next) => {

//   const now = new Date();

//   const hour = now.getHours();      // 0–23
//   const minutes = now.getMinutes(); // 0–59

//   // 🔥 Auto logout exactly at 4:10 PM
//   if (hour === 16 && minutes >= 6) {

//     req.session.destroy(() => {});

//     return res.status(401).json({
//       message: "Session expired at 4:10 PM (Test Mode)"
//     });
//   }

//   next();
// };
