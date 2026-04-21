import { request } from '../request'
import { Endpoints } from '../endpoints'
import type { SpiritType, HatchPredictInput, HatchCandidate } from '@/types/spirit'

export interface TypeMatchupQuery {
  attacker: SpiritType
  defender: SpiritType[]
}

export interface TypeMatchupResult {
  attacker: SpiritType
  defenders: SpiritType[]
  multiplier: number
  detail: { attacker: SpiritType; defender: SpiritType; multiplier: number }[]
  label: string
  advice: string
}

export interface HatchPredictResult {
  input: HatchPredictInput
  candidates: HatchCandidate[]
  dataVersion: string
}

export const toolService = {
  typeMatchup(query: TypeMatchupQuery): Promise<TypeMatchupResult> {
    return request.get<TypeMatchupResult>(Endpoints.toolTypeMatchup, {
      params: { attacker: query.attacker, defender: query.defender },
    })
  },

  hatchPredict(input: HatchPredictInput): Promise<HatchPredictResult> {
    return request.post<HatchPredictResult>(Endpoints.toolHatchPredict, input)
  },
}
