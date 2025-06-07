import React from 'react';

function Login({ adminPassword, setAdminPassword, handleAdminLogin, closeModal }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>كلمة المرور</h3>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="أدخل كلمة المرور"
        />
        <button onClick={handleAdminLogin}>دخول</button>
        <button className="cancel" onClick={closeModal}>إلغاء</button>
      </div>
    </div>
  );
}

export default Login;
