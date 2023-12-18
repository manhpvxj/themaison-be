import { EntityRepository, Repository } from "typeorm";

import { Banner } from "../models/banner";

@EntityRepository(Banner)
export class BannerRepository extends Repository<Banner> {}
