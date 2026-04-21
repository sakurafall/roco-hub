import { request } from '../request'
import { Endpoints } from '../endpoints'

export interface FeedbackPayload {
  targetType?: string
  targetId?: string
  type: 'error' | 'missing' | 'suggestion' | 'other'
  description: string
  images?: string[]
}

export interface FeedbackResult {
  id: string
  status: 'pending' | 'reviewed' | 'rejected'
}

export interface UploadTokenPayload {
  filename: string
  contentType: string
}

export interface UploadTokenResult {
  uploadUrl: string
  publicUrl: string
}

export const feedbackService = {
  submit(payload: FeedbackPayload): Promise<FeedbackResult> {
    return request.post<FeedbackResult>(Endpoints.feedback, payload)
  },

  getUploadToken(payload: UploadTokenPayload): Promise<UploadTokenResult> {
    return request.post<UploadTokenResult>(Endpoints.feedbackUploadToken, payload)
  },
}
