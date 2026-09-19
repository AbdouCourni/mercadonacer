// File: components/dashboard/assign-employee-modal.tsx
// Path: /components/dashboard/assign-employee-modal.tsx

'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, User, Phone, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Employee {
  id: string
  full_name: string
  phone: string
  is_active: boolean
}

interface AssignEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber: string
  currentEmployeeName: string | null
  onAssign: (orderId: string, employeeId: string) => Promise<void>
}

export function AssignEmployeeModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentEmployeeName,
  onAssign
}: AssignEmployeeModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch employees
  useEffect(() => {
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  const fetchEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard/employee')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
        // Auto-select current employee if assigned
        if (currentEmployeeName) {
          const current = data.employees?.find((e: Employee) => e.full_name === currentEmployeeName)
          if (current) {
            setSelectedEmployeeId(current.id)
          }
        }
      } else {
        setError('Impossible de charger la liste des employés')
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setError('Erreur lors du chargement des employés')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      setError('Veuillez sélectionner un employé')
      return
    }

    setAssigning(selectedEmployeeId)
    setError(null)
    try {
      await onAssign(orderId, selectedEmployeeId)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'assignation')
    } finally {
      setAssigning(null)
    }
  }

  // Filter employees by search
  const filteredEmployees = employees.filter(employee => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      employee.full_name.toLowerCase().includes(search) ||
      employee.phone.includes(search)
    )
  })

  const availableEmployees = filteredEmployees.filter(e => e.is_active !== false)
  const unavailableEmployees = filteredEmployees.filter(e => e.is_active === false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Package size={22} className="text-primary" />
              Assigner un employé
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Commande #{orderNumber}
              {currentEmployeeName && (
                <span className="ml-2 text-blue-600">
                  • Actuel: {currentEmployeeName}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un employé (nom, téléphone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-text-secondary/30 mb-4" />
              <h3 className="text-lg font-medium text-text-primary">Aucun employé</h3>
              <p className="text-text-secondary text-sm">
                Aucun employé n'est disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available Employees */}
              {availableEmployees.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-2">
                    <CheckCircle size={14} />
                    {availableEmployees.length} employé{availableEmployees.length > 1 ? 's' : ''} disponible{availableEmployees.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {availableEmployees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        isSelected={selectedEmployeeId === employee.id}
                        onSelect={() => setSelectedEmployeeId(employee.id)}
                        isAssigning={assigning === employee.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable Employees */}
              {unavailableEmployees.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    {unavailableEmployees.length} employé{unavailableEmployees.length > 1 ? 's' : ''} indisponible{unavailableEmployees.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2 opacity-60">
                    {unavailableEmployees.map((employee) => (
                      <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        isSelected={false}
                        onSelect={() => {}}
                        isAssigning={false}
                        disabled
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={!!assigning}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedEmployeeId || !!assigning || loading}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            {assigning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assignation...
              </>
            ) : (
              <>
                <User size={16} />
                Assigner l'employé
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Employee Card Component
// ============================================

interface EmployeeCardProps {
  employee: Employee
  isSelected: boolean
  onSelect: () => void
  isAssigning: boolean
  disabled?: boolean
}

function EmployeeCard({ employee, isSelected, onSelect, isAssigning, disabled }: EmployeeCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        disabled && "opacity-60 cursor-not-allowed hover:border-border hover:bg-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isSelected ? "bg-primary/10" : "bg-muted"
          )}>
            <User size={18} className={isSelected ? "text-primary" : "text-text-secondary"} />
          </div>
          <div>
            <p className="font-medium text-text-primary">{employee.full_name}</p>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {employee.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSelected && (
            <CheckCircle size={18} className="text-primary" />
          )}
          {isAssigning && (
            <Loader2 size={16} className="animate-spin text-primary" />
          )}
          {employee.is_active && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Disponible
            </span>
          )}
        </div>
      </div>
    </button>
  )
}