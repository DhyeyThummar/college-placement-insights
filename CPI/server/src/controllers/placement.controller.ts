import PlacementData from '../models/PlacementData.js';
import { Request, Response } from 'express';
import { PipelineStage } from 'mongoose';

export const getAllPlacements = async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params as any;
    const data = await PlacementData.find({ collegeId }).lean();
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch placements' });
  }
};

export const getPlacementStats = async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.params as any;
    const pipeline: PipelineStage[] = [
      { $match: { collegeId } },
      {
        $facet: {
          companyWise: [
            { $group: { _id: '$company', count: { $sum: 1 } } },
            { $project: { company: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } },
          ],
          branchWise: [
            { $group: { _id: '$branch', count: { $sum: 1 } } },
            { $project: { branch: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } },
          ],
          yearWise: [
            { $group: { _id: '$batchYear', count: { $sum: 1 }, avgPackage: { $avg: '$package' } } },
            { $project: { year: '$_id', count: 1, avgPackage: 1, _id: 0 } },
            { $sort: { year: 1 } },
          ],
          packageStats: [
            { $group: { _id: null, max: { $max: '$package' }, min: { $min: '$package' }, avg: { $avg: '$package' } } },
            { $project: { _id: 0, max: 1, min: 1, avg: 1 } },
          ],
        },
      },
    ];

    const [result] = await PlacementData.aggregate(pipeline);
    res.json({
      companyWise: result?.companyWise || [],
      branchWise: result?.branchWise || [],
      yearWise: result?.yearWise || [],
      packageStats: result?.packageStats?.[0] || { max: 0, min: 0, avg: 0 },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to aggregate stats' });
  }
};


