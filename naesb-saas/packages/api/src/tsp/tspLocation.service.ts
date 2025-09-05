/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import {
  DirectionOfFlowCode,
  LocationStatusIndicatorCode,
  LocationTypeIndicatorCode,
} from '@shared/model';
import { DirectionOfFlow } from '../db/directionOfFlow.entity';
import { LocationTypeIndicator } from '../db/locationTypeIndicator.entity';
import pinePrairieData from './pine_prairie.json';
import tgpLocationData from './tgp_locations.json';
import locationData from './locations.json';
import { Organization, TspLocation } from '../db';
import {
  DIRECTION_OF_FLOW_DATA,
  LOCATION_TYPE_INDICATOR_DATA,
  pipelines,
} from './constant';

@Injectable()
export class TspLocationService {
  constructor(
    @InjectRepository(TspLocation)
    private tspLocationRepository: Repository<TspLocation>,
    @InjectRepository(DirectionOfFlow)
    private directionOfFlowRepository: Repository<DirectionOfFlow>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(LocationTypeIndicator)
    private locationTypeIndicatorRepository: Repository<LocationTypeIndicator>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init();
  }

  private async init() {
    await this.directionOfFlowRepository.save(DIRECTION_OF_FLOW_DATA);
    await this.locationTypeIndicatorRepository.save(
      LOCATION_TYPE_INDICATOR_DATA,
    );
    await this.organizationRepository.save(pipelines);
    await this.tspLocationRepository.save(
      [...tgpLocationData, ...locationData, ...pinePrairieData].reduce(
        (acc: Array<TspLocation>, item) => {
          if (acc.every((entry) => entry.locationId !== item.Loc.toString())) {
            // @ts-ignore
            const LocationZone = item['Loc Zone']?.toString();
            const LocationStatusIndicator = item['Loc Stat Ind'];
            // @ts-ignore
            acc.push({
              directionOfFlow: item['Dir Flo'] as DirectionOfFlowCode,
              locationId: item.Loc.toString(),
              locationName:
                // @ts-ignore
                (item['Loc Name'] as string)?.toUpperCase() ||
                // @ts-ignore
                (item['Location Name'] as string)?.toUpperCase(),
              // @ts-ignore
              state: item['Loc St Abbrev'],
              county: item['Loc Cnty'],
              // @ts-ignore
              locator: item['Loc Loctr'],
              // @ts-ignore
              locatorIdentifier: item['Loc Loctr ID'],
              effectiveDate: item['Eff Date']?.toString(),
              // @ts-ignore
              inactiveDate: item['Inact Date']?.toString(),
              typeIndicator: item['Loc Type Ind'] as LocationTypeIndicatorCode,
              statusIndicator:
                LocationStatusIndicator as LocationStatusIndicatorCode,
              // @ts-ignore
              upstreamDownstreamEntityIndicator: item['Up/Dn Ind'],
              upstreamDownstreamEntityName: item['Up/Dn Name'],
              upstreamDownstreamEntityFercCid:
                item['Up/Dn FERC CID']?.toString(),
              upstreamDownstreamEntityFercCidIndicator:
                item['Up/Dn FERC CID Ind'],
              upstreamDownstreamIdentifierCode: item['Up/Dn ID']?.toString(),
              // @ts-ignore
              upstreamDownstreamIdentifierProprietaryCode:
                // @ts-ignore
                item['Up/Dn ID Prop']?.toString(),
              upstreamDownstreamEntityLocation: item['Up/Dn Loc']?.toString(),
              upstreamDownstreamEntityLocationName: item['Up/Dn Loc Name'],
              zone:
                typeof LocationZone !== 'string'
                  ? LocationZone?.toString()
                  : LocationZone,
              businessId: item.TSP.toString(),
            });
          }
          return acc;
        },
        [],
      ),
    );
  }

  async findMany(options: FindManyOptions<TspLocation>) {
    const [data, totalRecords] = await this.tspLocationRepository.findAndCount(
      options,
    );
    return { data, totalRecords };
  }

  async findOne(id: string) {
    return this.tspLocationRepository.findOne({ where: { locationId: id } });
  }
}
