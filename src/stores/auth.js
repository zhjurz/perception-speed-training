import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAdmin = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setUser(userData, userToken) {
    user.value = userData
    token.value = userToken
    if (userToken) {
      localStorage.setItem('userToken', userToken)
    }
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify(userData))
    }
  }

  function setAdmin(status) {
    isAdmin.value = status
  }

  function loadFromStorage() {
    const storedToken = localStorage.getItem('userToken')
    const storedUser = localStorage.getItem('userInfo')
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isAdmin.value = false
    localStorage.removeItem('userToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  }

  return {
    user,
    token,
    isAdmin,
    isLoggedIn,
    setUser,
    setAdmin,
    loadFromStorage,
    logout
  }
})
