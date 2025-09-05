"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const common_1 = require("@nestjs/common");
const flattenError = (error) => {
    if (typeof error === 'object')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Object.entries(error).reduce((acc, [key, err]) => {
            if (Array.isArray(err)) {
                if (key === '_errors') {
                    return err.join(', ');
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return {
                    ...acc,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    [key]: err.map((inner) => flattenError(inner)),
                };
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return { ...acc, [key]: flattenError(err) };
        }, {});
    return error;
};
const validate = async (schema, values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
        return result.data;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new common_1.BadRequestException(flattenError(result.error.format()));
};
exports.validate = validate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ2YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBcUQ7QUFHckQsTUFBTSxZQUFZLEdBQVEsQ0FDeEIsS0FBMEQsRUFDMUQsRUFBRTtJQUNGLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtRQUMzQiwrREFBK0Q7UUFDL0QsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQzNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdEIsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO29CQUNyQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3ZCO2dCQUNELCtEQUErRDtnQkFDL0QsT0FBTztvQkFDTCxHQUFHLEdBQUc7b0JBQ04sK0RBQStEO29CQUMvRCxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDL0MsQ0FBQzthQUNIO1lBQ0QsK0RBQStEO1lBQy9ELE9BQU8sRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzlDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNULE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUssTUFBTSxRQUFRLEdBQUcsS0FBSyxFQUMzQixNQUFTLEVBQ1QsTUFBUyxFQUNHLEVBQUU7SUFDZCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ2xCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztLQUNwQjtJQUNELGlFQUFpRTtJQUNqRSxNQUFNLElBQUksNEJBQW1CLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUMsQ0FBQztBQVZXLFFBQUEsUUFBUSxZQVVuQiJ9