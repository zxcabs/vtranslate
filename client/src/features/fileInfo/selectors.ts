import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../store'
import { fileInfoAdapter } from './fileInfoSlice'

export const { selectById } = fileInfoAdapter.getSelectors<RootState>((state) => state.fileInfo)
export const selectStatusById = createSelector([selectById], (model) => model?.status)
