// Authentication module for INOUT
// Handles user signup, login, logout, and session management
// Uses localStorage for client-side storage (replace with backend API calls for production)

(function(){
  // Initialize auth state on page load
  window.authInit = function(){
    const user = JSON.parse(localStorage.getItem('inout_user'));
    if(user){
      updateAuthUI(user);
    }
  };

  // Sign up a new user
  window.authSignup = async function(payload){
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('inout_users') || '[]');
      const exists = users.some(u => u.email === payload.email);
      
      if(exists){
        console.log('User already exists:', payload.email);
        return false;
      }

      // Create user object with unique ID
      const user = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        accountType: payload.accountType,
        email: payload.email,
        password: payload.password, // Note: In production, NEVER store plain text passwords
        createdAt: new Date().toISOString()
      };

      // Add account type specific fields
      if(payload.accountType === 'customer'){
        user.fullName = payload.fullName;
        user.country = payload.country;
        user.city = payload.city;
        user.profile = {
          avatar: null,
          bio: '',
          phone: null
        };
      } else if(payload.accountType === 'business'){
        user.businessName = payload.businessName;
        user.ownerName = payload.ownerName;
        user.phone = payload.phone;
        user.country = payload.country;
        user.state = payload.state;
        user.city = payload.city;
        user.category = payload.category;
        user.profile = {
          avatar: null,
          description: '',
          website: null,
          verified: false
        };
        user.services = [];
        user.prices = {};
        user.photos = [];
        user.location = {
          address: '',
          coordinates: null
        };
        user.openingHours = {};
      }

      // Save to users list
      users.push(user);
      localStorage.setItem('inout_users', JSON.stringify(users));

      // Set current user session
      const sessionUser = { ...user };
      delete sessionUser.password; // Don't store password in session
      localStorage.setItem('inout_user', JSON.stringify(sessionUser));

      console.log('User created:', user.id, user.accountType);
      return true;
    } catch(err){
      console.error('Signup error:', err);
      return false;
    }
  };

  // Login user
  window.authLogin = async function(email, password, accountType){
    try {
      const users = JSON.parse(localStorage.getItem('inout_users') || '[]');
      const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.accountType === accountType
      );

      if(!user){
        console.log('Invalid credentials');
        return false;
      }

      // Set current user session
      const sessionUser = { ...user };
      delete sessionUser.password; // Don't store password in session
      localStorage.setItem('inout_user', JSON.stringify(sessionUser));

      console.log('Login successful:', user.id, user.accountType);
      return true;
    } catch(err){
      console.error('Login error:', err);
      return false;
    }
  };

  // Logout user
  window.authLogout = function(){
    localStorage.removeItem('inout_user');
    window.location.href = 'index.html';
  };

  // Get current user
  window.authGetUser = function(){
    return JSON.parse(localStorage.getItem('inout_user'));
  };

  // Check if user is authenticated
  window.authIsAuthenticated = function(){
    return !!localStorage.getItem('inout_user');
  };

  // Require authentication on protected pages
  window.authRequireLogin = function(){
    if(!window.authIsAuthenticated()){
      window.location.href = 'login.html';
      return false;
    }
    return true;
  };

  // Require specific account type
  window.authRequireAccountType = function(accountType){
    if(!window.authIsAuthenticated()){
      window.location.href = 'login.html';
      return false;
    }
    const user = window.authGetUser();
    if(user.accountType !== accountType){
      window.location.href = 'index.html';
      return false;
    }
    return true;
  };

  // Update UI based on auth state
  function updateAuthUI(user){
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    if(authLinks && userMenu){
      authLinks.style.display = 'none';
      userMenu.style.display = 'flex';
      
      if(user.accountType === 'customer'){
        if(userName) userName.textContent = user.fullName || user.email;
      } else {
        if(userName) userName.textContent = user.businessName || user.email;
      }

      if(logoutBtn){
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.authLogout();
        });
      }
    }
  }

  // Check auth status on page load
  document.addEventListener('DOMContentLoaded', () => {
    window.authInit();
  });

})();
