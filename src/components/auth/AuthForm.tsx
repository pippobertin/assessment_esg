'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { signIn, signUp } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    school: '',
    grade: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        setMessage('Login effettuato con successo!')
      } else {
        await signUp(formData.email, formData.password, {
          email: formData.email,
          name: formData.name,
          school: formData.school,
          grade: formData.grade
        })
        setMessage('Registrazione completata! Controlla la tua email per confermare.')
      }
    } catch (error: any) {
      setMessage(error.message || 'Errore durante l\'autenticazione')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? 'Accedi' : 'Registrati'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Accedi al tuo account per continuare l\'assessment ESG'
              : 'Crea un account per iniziare il tuo assessment ESG'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tua.email@scuola.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="La tua password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome e Cognome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Mario Rossi"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="school" className="text-sm font-medium">
                    Scuola
                  </label>
                  <Input
                    id="school"
                    name="school"
                    placeholder="Liceo Scientifico Volta"
                    value={formData.school}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="grade" className="text-sm font-medium">
                    Classe
                  </label>
                  <Input
                    id="grade"
                    name="grade"
                    placeholder="5A"
                    value={formData.grade}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {message && (
              <div className={`text-sm p-3 rounded-md ${
                message.includes('successo') || message.includes('completata')
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Accesso in corso...' : 'Registrazione in corso...') 
                : (isLogin ? 'Accedi' : 'Registrati')
              }
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
              setFormData({
                email: '',
                password: '',
                name: '',
                school: '',
                grade: ''
              })
            }}
          >
            {isLogin 
              ? 'Non hai un account? Registrati' 
              : 'Hai già un account? Accedi'
            }
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}