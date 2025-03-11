function runMonteCarloSim() {
    const SIMULATION_RUNS = 30;
    const SIMULATION_DAYS = 7;
    
    const MACHINES_AVAILABLE = 20;
    
    // Operating hours parameters
    const OPERATING_HOURS = 24; // Laundromat open 24 hours
    const AVG_MACHINE_USAGE_HOURS = 4; // Average time a customer uses a machine
    const DAILY_CUSTOMER_TARGET = 100; // Target number of customers per day

    // Different wash programs cost more or less but take the same amount of time
    const AVG_SPEND_PER_STUDENT = 8;
    const STD_DEV_SPEND = 2;

    const FIXED_COST = 100;
    const VARIABLE_COST_FACTOR = 0.3;
    const MAINTENANCE_COST = 150;

    const DAYS_INFO = [
        { name: "Monday", priceModifier: 0.9 },
        { name: "Tuesday", priceModifier: 0.9 },
        { name: "Wednesday", priceModifier: 0.9 },
        { name: "Thursday", priceModifier: 0.9 },
        { name: "Friday", priceModifier: 0.8 },
        { name: "Saturday", priceModifier: 1.0 },
        { name: "Sunday", priceModifier: 1.0 }
    ];

    let dailyTotalsWithDiscounts = Array(SIMULATION_DAYS).fill(null).map(() => ({
        revenue: 0, costs: 0, profit: 0, customers: 0, lostCustomers: 0, lostRevenue: 0
    }));

    let dailyTotalsWithoutDiscounts = Array(SIMULATION_DAYS).fill(null).map(() => ({
        revenue: 0, costs: 0, profit: 0, customers: 0, lostCustomers: 0, lostRevenue: 0
    }));

    for (let run = 0; run < SIMULATION_RUNS; run++) {
        for (let day = 0; day < SIMULATION_DAYS; day++) {
            const dayInfo = DAYS_INFO[day];
            
            // machine capacity based on hours
            const totalDailyMachineCapacity = Math.floor(MACHINES_AVAILABLE * OPERATING_HOURS / AVG_MACHINE_USAGE_HOURS);
            
            // Random variation between 80% and 120% of base values
            const randomVariation = 0.8 + Math.random() * 0.4;
            
            // DIFFERENT CUSTOMER BEHAVIOR BASED ON DISCOUNT STRATEGY
            
            // For NO DISCOUNT scenario - traditional weekend boost
            const isWeekend = (day === 5 || day === 6);
            const weekendBoostNoDiscount = isWeekend ? 1.4 : 1.0;
            const numberOfCustomersNoDiscount = Math.round(DAILY_CUSTOMER_TARGET * weekendBoostNoDiscount * randomVariation);
            
            // For DISCOUNT scenario - reduced weekend boost, increased weekday traffic
            const weekdayBoostWithDiscount = 1.10; // 10% boost on weekdays with discounts
            const weekendBoostWithDiscount = 1.2; // Only 20% vs 40% without discounts
            const totalBoostWithDiscount = isWeekend
                ? weekendBoostWithDiscount
                : weekdayBoostWithDiscount;
            const numberOfCustomersWithDiscount = Math.round(DAILY_CUSTOMER_TARGET * totalBoostWithDiscount * randomVariation);
            
            // served customers
            // For NO DISCOUNT scenario
            const servedCustomersNoDiscount = Math.min(numberOfCustomersNoDiscount, totalDailyMachineCapacity);
            const lostCustomersNoDiscount = Math.max(0, numberOfCustomersNoDiscount - servedCustomersNoDiscount);
            
            // For DISCOUNT scenario
            const servedCustomersWithDiscount = Math.min(numberOfCustomersWithDiscount, totalDailyMachineCapacity);
            const lostCustomersWithDiscount = Math.max(0, numberOfCustomersWithDiscount - servedCustomersWithDiscount);
            
            let dailyRevenueWithDiscount = 0;
            let dailyRevenueWithoutDiscount = 0;
            let lostRevenueWithDiscount = 0;
            let lostRevenueWithoutDiscount = 0;

            for (let i = 0; i < servedCustomersWithDiscount; i++) {
                const spendAmount = getRandomValue(AVG_SPEND_PER_STUDENT, STD_DEV_SPEND);
                dailyRevenueWithDiscount += spendAmount * dayInfo.priceModifier;
            }
            
            for (let i = 0; i < servedCustomersNoDiscount; i++) {
                const spendAmount = getRandomValue(AVG_SPEND_PER_STUDENT, STD_DEV_SPEND);
                dailyRevenueWithoutDiscount += spendAmount;
            }

            for (let i = 0; i < lostCustomersWithDiscount; i++) {
                const spendAmount = getRandomValue(AVG_SPEND_PER_STUDENT, STD_DEV_SPEND);
                lostRevenueWithDiscount += spendAmount * dayInfo.priceModifier;
            }
            
            for (let i = 0; i < lostCustomersNoDiscount; i++) {
                const spendAmount = getRandomValue(AVG_SPEND_PER_STUDENT, STD_DEV_SPEND);
                lostRevenueWithoutDiscount += spendAmount;
            }

            let dailyCostsForDiscounted = FIXED_COST + (dailyRevenueWithDiscount * VARIABLE_COST_FACTOR);
            let dailyCostsForNotDiscounted = FIXED_COST + (dailyRevenueWithoutDiscount * VARIABLE_COST_FACTOR);

            if (day === 0) {  // Monday
                dailyCostsForDiscounted += MAINTENANCE_COST;
                dailyCostsForNotDiscounted += MAINTENANCE_COST;
            }

            const dailyProfitWithDiscount = dailyRevenueWithDiscount - dailyCostsForDiscounted;
            const dailyProfitWithoutDiscount = dailyRevenueWithoutDiscount - dailyCostsForNotDiscounted;

            dailyTotalsWithDiscounts[day].revenue += dailyRevenueWithDiscount;
            dailyTotalsWithDiscounts[day].costs += dailyCostsForDiscounted;
            dailyTotalsWithDiscounts[day].profit += dailyProfitWithDiscount;
            dailyTotalsWithDiscounts[day].customers += servedCustomersWithDiscount;
            dailyTotalsWithDiscounts[day].lostCustomers += lostCustomersWithDiscount;
            dailyTotalsWithDiscounts[day].lostRevenue += lostRevenueWithDiscount;

            dailyTotalsWithoutDiscounts[day].revenue += dailyRevenueWithoutDiscount;
            dailyTotalsWithoutDiscounts[day].costs += dailyCostsForNotDiscounted;
            dailyTotalsWithoutDiscounts[day].profit += dailyProfitWithoutDiscount;
            dailyTotalsWithoutDiscounts[day].customers += servedCustomersNoDiscount;
            dailyTotalsWithoutDiscounts[day].lostCustomers += lostCustomersNoDiscount;
            dailyTotalsWithoutDiscounts[day].lostRevenue += lostRevenueWithoutDiscount;
        }
    }

    const resultsWithDiscounts = dailyTotalsWithDiscounts.map((day, index) => ({
        dayOfWeek: DAYS_INFO[index].name,
        averageRevenue: (day.revenue / SIMULATION_RUNS).toFixed(2),
        averageCosts: (day.costs / SIMULATION_RUNS).toFixed(2),
        averageProfit: (day.profit / SIMULATION_RUNS).toFixed(2),
        averageCustomers: (day.customers / SIMULATION_RUNS).toFixed(2),
        averageLostCustomers: (day.lostCustomers / SIMULATION_RUNS).toFixed(2),
        averageLostRevenue: (day.lostRevenue / SIMULATION_RUNS).toFixed(2),
    }));
    
    const resultsWithoutDiscounts = dailyTotalsWithoutDiscounts.map((day, index) => ({
        dayOfWeek: DAYS_INFO[index].name,
        averageRevenue: (day.revenue / SIMULATION_RUNS).toFixed(2),
        averageCosts: (day.costs / SIMULATION_RUNS).toFixed(2),
        averageProfit: (day.profit / SIMULATION_RUNS).toFixed(2),
        averageCustomers: (day.customers / SIMULATION_RUNS).toFixed(2),
        averageLostCustomers: (day.lostCustomers / SIMULATION_RUNS).toFixed(2),
        averageLostRevenue: (day.lostRevenue / SIMULATION_RUNS).toFixed(2),
    }));
    
    return { withoutDiscounts: resultsWithoutDiscounts, withDiscounts: resultsWithDiscounts };
}

function getRandomValue(standardValue, standardDeviation) {
    return standardValue - standardDeviation + 2 * standardDeviation * Math.random();
}

module.exports = { runMonteCarloSim };