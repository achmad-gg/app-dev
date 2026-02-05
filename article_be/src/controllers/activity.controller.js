import * as ActivityService from '../services/activity.service.js'

export const findAll = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)

    const result = await ActivityService.getLogs({ page, limit })

    res.json({
      data: result.data,
      total: result.total,
      page,
      limit,
    })
  } catch (err) {
    next(err)
  }
}
