import { useState } from 'react'
import type { FormData } from '../../../types/formData'
import { defaultFormData } from '../../../types/formData'
import CreateVirtualFile from '../older-adults/CreateVirtualRecordPage'


export default function Dashboard() {
  const [formData, setFormData] = useState<FormData>(defaultFormData)

  function onInputChange(field: keyof FormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value } as FormData))
  }

  return (
    <div className="container py-4">
      <h3>Dashboard</h3>
     <CreateVirtualFile />
    </div>
  )
}