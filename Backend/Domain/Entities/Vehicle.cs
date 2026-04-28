using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Vehicle
    {
        public Guid UserId { get; set; }
        public string VehicleName { get; set; } = string.Empty;
        public string VehicleId { get; set; } = string.Empty;
        public string VehicleImage { get; set; } = string.Empty;
    }
}
