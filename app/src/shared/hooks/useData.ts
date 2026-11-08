import { useContext } from 'react'
import { DataContext } from '@/shared/state/DataContext'

export const useData = () => useContext(DataContext)
